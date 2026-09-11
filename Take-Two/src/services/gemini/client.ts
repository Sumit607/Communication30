import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { coachSchema, validateCoachResult } from './coachSchema';
import { coachSystemPrompt, coachTaskPrompt } from './coachPrompt';
import { inspectPcmWave } from '../audio/wave';
import { inspectAac, type VerifiedAudio } from '../audio/aac';
export { DEFAULT_MODEL } from './model';
export function publicAiError(error: unknown) {
  const status =
    typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0;
  if (status === 429)
    return 'Gemini quota reached. Your work is saved. Retry later; no paid fallback was used.';
  if (status === 401 || status === 403)
    return 'Gemini access was denied. Check your API key and project in Settings.';
  if (status === 404)
    return 'This model is unavailable. Choose an accessible free-tier model in Settings.';
  return 'Analysis could not finish or its response was invalid. Your work is saved. Check your connection and settings before retrying.';
}
export async function requestJson<T>({
  apiKey,
  model,
  schema,
  system,
  data,
  audio,
  signal,
}: {
  apiKey: string;
  model: string;
  schema: z.ZodType<T>;
  system: string;
  data: unknown;
  audio?: VerifiedAudio;
  signal?: AbortSignal;
}): Promise<T> {
  if (!/^gemini-[a-zA-Z0-9._-]+$/.test(model))
    throw new Error('Configure a Gemini model in Settings.');
  const verified = audio ? inspectAac(audio.base64) : undefined;
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 90000, retryOptions: { attempts: 1 } },
  });
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: JSON.stringify(data) },
          ...(verified
            ? [{ inlineData: { mimeType: verified.mimeType, data: verified.base64 } }]
            : []),
        ],
      },
    ],
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(schema),
      maxOutputTokens: 8192,
      abortSignal: signal,
    },
  });
  if (!response.text) throw new Error('No analysis returned.');
  return schema.parse(JSON.parse(response.text));
}
export async function checkModelAccess(apiKey: string, model: string) {
  if (!/^gemini-[a-zA-Z0-9._-]+$/.test(model)) throw new Error('Enter an exact Gemini model ID.');
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 30000, retryOptions: { attempts: 1 } },
  });
  const response = await ai.models.generateContent({
    model,
    contents: 'Reply with exactly OK.',
    config: { maxOutputTokens: 256 },
  });
  if (response.text?.trim() !== 'OK')
    throw new Error('The connection test returned an unexpected reply.');
}
export async function evaluateWave({
  apiKey,
  model,
  audio,
  base64,
  topic,
  structure,
  signal,
}: {
  apiKey: string;
  model: string;
  audio: Uint8Array;
  base64: string;
  topic: string;
  structure: string;
  signal?: AbortSignal;
}) {
  const info = inspectPcmWave(audio);
  if (!/^gemini-[a-zA-Z0-9._-]+$/.test(model)) throw new Error('Configure a tested Gemini model.');
  // Only the validated WAV bytes may be encoded by the caller. Verify the exact bytes again.
  const decoded = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  if (decoded.length !== audio.length || decoded.some((byte, i) => byte !== audio[i]))
    throw new Error('Audio encoding does not match the verified audio.');
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60000 } });
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: coachTaskPrompt({ topic, structure, durationS: info.durationS }) },
          { inlineData: { mimeType: 'audio/wav', data: base64 } },
        ],
      },
    ],
    config: {
      systemInstruction: coachSystemPrompt,
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(coachSchema),
      abortSignal: signal,
    },
  });
  if (!response.text) throw new Error('The provider returned no critique.');
  return {
    result: validateCoachResult(JSON.parse(response.text), info.durationS),
    usage: response.usageMetadata ?? null,
  };
}
