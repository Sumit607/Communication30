/* global __dirname */
// Manual live smoke test with synthetic speech only; never part of npm test or EAS hooks.
// Supply TAKE_TWO_TEST_KEY in the process environment and two PCM WAV paths as arguments.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { GoogleGenAI } = require('@google/genai');
const { z } = require('zod');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};

const root = path.join(__dirname, '../src/services');
const { publicAiError } = require(path.join(root, 'gemini/client.ts'));
const { coachSchema, validateCoachResult } = require(path.join(root, 'gemini/coachSchema.ts'));
const { coachSystemPrompt } = require(path.join(root, 'gemini/coachPrompt.ts'));
const { DEFAULT_MODEL } = require(path.join(root, 'gemini/model.ts'));
const { deltaPrompt, deltaSchema, validateDelta } = require(
  path.join(root, 'gemini/deltaPrompt.ts'),
);
const { inspectPcmWave } = require(path.join(root, 'audio/wave.ts'));

async function main() {
  const apiKey = process.env.TAKE_TWO_TEST_KEY;
  if (!apiKey || process.argv.length !== 4)
    throw new Error('Provide the test key and two synthetic WAV files.');
  const first = fs.readFileSync(process.argv[2]);
  const second = fs.readFileSync(process.argv[3]);
  const firstInfo = inspectPcmWave(first);
  const secondInfo = inspectPcmWave(second);
  const topic = 'Should local councils fund public libraries?';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 90000, retryOptions: { attempts: 1 } },
  });
  console.log('Checking Take 1 speech with the native Coach request settings.');
  const firstResponse = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              topic,
              structure: 'Point, reason, example, conclusion',
              duration_s: firstInfo.durationS,
              followup_mode: 'challenge',
            }),
          },
          { inlineData: { mimeType: 'audio/wav', data: first.toString('base64') } },
        ],
      },
    ],
    config: {
      systemInstruction: coachSystemPrompt,
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(coachSchema),
      maxOutputTokens: 8192,
    },
  });
  const original = {
    result: validateCoachResult(JSON.parse(firstResponse.text), firstInfo.durationS),
  };
  if (!original.result.transcript.toLowerCase().includes('librar'))
    throw new Error('The Coach transcript missed the spoken topic.');
  if (!original.result.corrections.length)
    throw new Error('No corrections were supplied for the deliberately weak sample.');
  console.log(
    JSON.stringify({
      stage: 'take1',
      passed: true,
      model: DEFAULT_MODEL,
      durationS: firstInfo.durationS,
      corrections: original.result.corrections.length,
      scores: Object.keys(original.result.scores).length,
      transcriptCharacters: original.result.transcript.length,
      validatedQuotesAndTimestamps: true,
      hiddenFollowupPresent: Boolean(original.result.hidden_follow_up),
    }),
  );

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              topic,
              original_transcript: original.result.transcript,
              original_fixes: original.result.corrections,
            }),
          },
          { inlineData: { mimeType: 'audio/wav', data: second.toString('base64') } },
        ],
      },
    ],
    config: {
      systemInstruction: deltaPrompt,
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(deltaSchema),
      maxOutputTokens: 8192,
    },
  });
  const delta = validateDelta(JSON.parse(response.text), original.result);
  if (!delta.transcript.toLowerCase().includes('librar'))
    throw new Error('The comparison transcript missed the spoken topic.');
  console.log(
    JSON.stringify({
      stage: 'take2-comparison',
      passed: true,
      durationS: secondInfo.durationS,
      originalCorrectionsMatched: delta.corrections.length,
      verdicts: delta.corrections.map((item) => item.verdict),
      transcriptCharacters: delta.transcript.length,
    }),
  );
  console.log(
    JSON.stringify({
      passed: true,
      limitation:
        'Synthetic PCM WAV validates live prompts and schemas; Android camera capture and AAC extraction still require device testing.',
    }),
  );
}

main().catch((error) => {
  const diagnostic = String(error.message ?? error)
    .replaceAll(process.env.TAKE_TWO_TEST_KEY ?? 'NO_KEY_SUPPLIED', '[redacted]')
    .replace(/AIza[\w-]+/g, '[redacted]')
    .slice(0, 1500);
  console.error(
    JSON.stringify({
      passed: false,
      status: error.status ?? null,
      message: publicAiError(error),
      diagnostic,
    }),
  );
  process.exitCode = 1;
});
