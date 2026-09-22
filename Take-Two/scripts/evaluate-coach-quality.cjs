/* global __dirname */
// Manual, synthetic-speech evaluation. Evidence stays in the supplied temporary directory.
// Never run as a build hook; never use an EXPO_PUBLIC credential.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');
const ts = require('typescript');
const { GoogleGenAI } = require('@google/genai');
const { z } = require('zod');
require.extensions['.ts'] = (module, filename) => {
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText,
    filename,
  );
};
const services = path.join(__dirname, '../src/services');
const { coachSchema, validateCoachResult, overallScore } = require(
  path.join(services, 'gemini/coachSchema.ts'),
);
const { coachSystemPrompt, COACH_PROMPT_VERSION } = require(
  path.join(services, 'gemini/coachPrompt.ts'),
);
const { deltaSchema, deltaPrompt, validateDelta } = require(
  path.join(services, 'gemini/deltaPrompt.ts'),
);
const { followupSchema, followupPrompt } = require(path.join(services, 'gemini/followupPrompt.ts'));
const { DEFAULT_MODEL } = require(path.join(services, 'gemini/model.ts'));
const { inspectPcmWave } = require(path.join(services, 'audio/wave.ts'));
const folder = process.argv[2];
const retryFailures = process.argv[3] === '--retry-provider-failures';
const apiKey = process.env.TAKE_TWO_TEST_KEY;
const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const tokens = (text) => normalize(text).split(/\s+/).filter(Boolean);
const redact = (text) => String(text).replace(/AIza[\w-]+/g, '[redacted]');
const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(folder, name), 'utf8').replace(/^\uFEFF/, ''));
const write = (name, data) =>
  fs.writeFileSync(path.join(folder, name), redact(JSON.stringify(data, null, 2)));
function distance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < b.length; j++)
      next[j + 1] = Math.min(next[j] + 1, row[j + 1] + 1, row[j] + (a[i] === b[j] ? 0 : 1));
    row = next;
  }
  return row[b.length];
}
function integrity(id, result) {
  if (id === 'silence')
    return { noSpeech: true, returnedTranscript: result.transcript, returnedScores: result.scores };
  const reference = readJson(id + '.reference.json').text;
  const a = tokens(reference),
    b = tokens(result.transcript);
  const events = fs
    .readFileSync(
      path.join(
        folder,
        id +
          (fs.existsSync(path.join(folder, id + '.calibration.timings.tsv'))
            ? '.calibration.timings.tsv'
            : '.timings.tsv'),
      ),
      'utf8',
    )
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const [at, position, text] = line.replace(/^\uFEFF/, '').split('\t');
      return { at: Number(at), position: Number(position), text: normalize(text) };
    });
  return {
    referenceWords: a.length,
    transcriptWords: b.length,
    wordErrorRate: distance(a, b) / a.length,
    timestampReference: fs.existsSync(path.join(folder, id + '.calibration.timings.tsv'))
      ? 'Separate 16kHz synthesis word events; approximate alignment, not forced alignment of uploaded audio'
      : 'Uncalibrated synthesizer events; do not interpret timestamp errors as app defects',
    wordCountError: Math.abs(a.length - b.length) / a.length,
    referenceUmUh: a.filter((word) => word === 'um' || word === 'uh').length,
    transcriptUmUh: b.filter((word) => word === 'um' || word === 'uh').length,
    corrections: result.corrections.map((fix) => {
      const quote = tokens(fix.quote),
        matches = [];
      for (let i = 0; i < events.length; i++) {
        if (quote.every((word, offset) => events[i + offset]?.text === word))
          matches.push(events[i].at);
      }
      return {
        id: fix.id,
        quote: fix.quote,
        sourceQuoteFound: normalize(reference).includes(normalize(fix.quote)),
        quotedAtS: fix.at_s,
        sourceTimesS: matches,
        closestTimingErrorS: matches.length
          ? Math.min(...matches.map((at) => Math.abs(at - fix.at_s)))
          : null,
      };
    }),
  };
}
async function main() {
  if (!folder || !apiKey) throw new Error('Provide an evidence directory and TAKE_TWO_TEST_KEY.');
  const prior = retryFailures ? readJson('results.json') : [];
  const retryNames = new Set(prior.filter((item) => item.providerFailure).map((item) => item.name));
  const resultFile = retryFailures ? 'retry-results.json' : 'results.json';
  if (fs.existsSync(path.join(folder, resultFile)))
    throw new Error('This run already exists. Use a fresh directory or the one-time retry flag.');
  // Eight seconds of genuine zero-amplitude PCM, not a renamed video or fabricated transcription.
  const silence = Buffer.alloc(44 + 8000 * 2 * 8);
  silence.write('RIFF');
  silence.writeUInt32LE(silence.length - 8, 4);
  silence.write('WAVEfmt ', 8);
  silence.writeUInt32LE(16, 16);
  silence.writeUInt16LE(1, 20);
  silence.writeUInt16LE(1, 22);
  silence.writeUInt32LE(8000, 24);
  silence.writeUInt32LE(16000, 28);
  silence.writeUInt16LE(2, 32);
  silence.writeUInt16LE(16, 34);
  silence.write('data', 36);
  silence.writeUInt32LE(silence.length - 44, 40);
  fs.writeFileSync(path.join(folder, 'silence.wav'), silence);
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 90000, retryOptions: { attempts: 1 } },
  });
  const results = [];
  let consecutiveProviderFailures = 0;
  let quotaReached = false;
  write(retryFailures ? 'retry-metadata.json' : 'run-metadata.json', {
    startedAt: new Date().toISOString(),
    model: DEFAULT_MODEL,
    promptVersion: COACH_PROMPT_VERSION,
    promptSha256: crypto.createHash('sha256').update(coachSystemPrompt).digest('hex'),
    audio: 'synthetic 8kHz 16-bit PCM WAV',
    timeoutMs: 90000,
    maxOutputTokens: 8192,
    retries: 'none',
    personalMedia: false,
  });
  async function request(name, audioId, kind, data, original) {
    if (retryFailures && !retryNames.has(name))
      return prior.find((item) => item.name === name)?.result ?? null;
    if (quotaReached || consecutiveProviderFailures >= 3) {
      const skipped = {
        name,
        skipped: quotaReached
          ? 'Quota reached; stopping live requests.'
          : 'Three consecutive provider failures; stopping live requests.',
      };
      results.push(skipped);
      return null;
    }
    const audio = fs.readFileSync(path.join(folder, audioId + '.wav'));
    const info = inspectPcmWave(audio);
    const system =
      kind === 'coach' ? coachSystemPrompt : kind === 'delta' ? deltaPrompt : followupPrompt;
    const schema = kind === 'coach' ? coachSchema : kind === 'delta' ? deltaSchema : followupSchema;
    const start = Date.now();
    console.log(JSON.stringify({ started: name, audioDurationS: info.durationS }));
    let raw;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: JSON.stringify({ ...data, duration_s: info.durationS }) },
              { inlineData: { mimeType: 'audio/wav', data: audio.toString('base64') } },
            ],
          },
        ],
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(schema),
          maxOutputTokens: 8192,
        },
      });
      consecutiveProviderFailures = 0;
      raw = JSON.parse(response.text);
      write(name + '.raw.json', {
        response: raw,
        usage: response.usageMetadata,
        latencyMs: Date.now() - start,
      });
      const parsed =
        kind === 'coach'
          ? validateCoachResult(raw, info.durationS)
          : kind === 'delta'
            ? validateDelta(raw, original)
            : schema.parse(raw);
      const record = {
        name,
        contractPassed: true,
        latencyMs: Date.now() - start,
        ...(kind === 'coach'
          ? {
              overall: overallScore(parsed),
              scores: parsed.scores,
              integrity: integrity(audioId, parsed),
            }
          : {}),
        result: parsed,
      };
      results.push(record);
      write(resultFile, results);
      console.log(
        JSON.stringify({
          completed: name,
          contractPassed: true,
          latencyMs: record.latencyMs,
          overall: record.overall,
          wordErrorRate: record.integrity?.wordErrorRate,
        }),
      );
      return parsed;
    } catch (error) {
      if (error.status === 429) quotaReached = true;
      if (!raw) consecutiveProviderFailures++;
      const record = {
        name,
        contractPassed: false,
        providerFailure: !raw,
        status: error.status ?? null,
        error: redact(error.message).slice(0, 2000),
        latencyMs: Date.now() - start,
      };
      results.push(record);
      write(resultFile, results);
      console.log(JSON.stringify(record));
      return null;
    }
  }
  const task = {
    topic: 'Should local councils fund public libraries?',
    structure: 'Point, reason, example, conclusion',
    followup_mode: 'challenge',
  };
  const weak = await request('weak', 'weak', 'coach', task);
  await request('good', 'good', 'coach', task);
  await request('fillers', 'fillers', 'coach', task);
  await request('injection', 'injection', 'coach', task);
  await request('silence', 'silence', 'coach', task);
  await request('good-repeat', 'good', 'coach', task);
  if (weak) {
    const compare = {
      topic: task.topic,
      original_transcript: weak.transcript,
      original_fixes: weak.corrections,
    };
    await request('delta-unchanged', 'weak', 'delta', compare, weak);
    await request('delta-improved', 'good', 'delta', compare, weak);
  }
  const question = {
    question: 'How would you pay for longer library opening hours without increasing the budget?',
  };
  await request('followup-relevant', 'answer_good', 'followup', question);
  await request('followup-off-topic', 'answer_off_topic', 'followup', question);
  write(resultFile, results);
  console.log(
    'Evaluation complete. Contract pass does not imply coaching-quality pass; review the saved evidence.',
  );
}
main().catch((error) => {
  console.error(redact(error.message));
  process.exitCode = 1;
});
