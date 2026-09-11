import { eq } from 'drizzle-orm';
import type { AppDatabase } from '@/db/client';
import { essayFeedback, settings } from '@/db/schema';
import { loadSettings } from './settings-service';
import { getCredential } from './security/credentials';
import { extractAudio } from './audio/native';
import { requestJson, publicAiError } from './gemini/client';
import { resolveModel } from './gemini/model';
import { coachSchema, validateCoachResult } from './gemini/coachSchema';
import { coachSystemPrompt } from './gemini/coachPrompt';
import { deltaPrompt, deltaSchema } from './gemini/deltaPrompt';
import { essayPrompt, essaySchema } from './gemini/essayPrompt';
import { followupPrompt, followupSchema } from './gemini/followupPrompt';
import { dayTakes } from '@/db/repositories/recording';
import { originalCoach, saveCoach, saveDelta, takeFeedback } from '@/db/repositories/coaching';
import { assertDayUnlocked, newId } from '@/db/repositories/programme';
import { loadWriting } from '@/db/repositories/writing';
import { getFollowupAttempt, saveFollowupFeedback } from '@/db/repositories/live-response';
const active = new Set<string>();
export function acknowledgeFreeTier(db: AppDatabase) {
  db.insert(settings)
    .values({ id: 1, privacyAcknowledgedAt: new Date() })
    .onConflictDoUpdate({ target: settings.id, set: { privacyAcknowledgedAt: new Date() } })
    .run();
}
async function access(db: AppDatabase) {
  const config = loadSettings(db),
    apiKey = await getCredential();
  if (!config?.privacyAcknowledgedAt)
    throw new Error('Read and accept the free-tier data policy in Settings first.');
  if (!apiKey) throw new Error('Save your Gemini key in Settings first.');
  return { apiKey, model: resolveModel(config.geminiModel) };
}
async function exclusive<T>(id: string, action: () => Promise<T>) {
  if (active.has(id)) throw new Error('This analysis is already running.');
  active.add(id);
  try {
    return await action();
  } finally {
    active.delete(id);
  }
}
export async function analyseTake(
  db: AppDatabase,
  dayId: string,
  takeId: string,
  signal?: AbortSignal,
) {
  const day = assertDayUnlocked(db, dayId),
    config = await access(db);
  const saved = dayTakes(db, dayId).filter((take) => take.state === 'saved'),
    take = saved.find((item) => item.id === takeId);
  if (!take?.filePath) throw new Error('A saved recording is required.');
  const first = saved[0].id === takeId;
  if (takeFeedback(db, takeId, first ? 'coach' : 'delta')) return;
  return exclusive(takeId, async () => {
    const audio = await extractAudio(take.filePath!);
    if (signal?.aborted) throw new Error('Analysis cancelled before upload.');
    try {
      if (first) {
        const result = await requestJson({
          ...config,
          audio,
          signal,
          schema: coachSchema,
          system: coachSystemPrompt,
          data: {
            topic: day.brief,
            structure: day.structureExpected,
            duration_s: audio.durationS,
            followup_mode: day.interactionMode,
          },
        });
        saveCoach(
          db,
          dayId,
          takeId,
          validateCoachResult(result, audio.durationS),
          config.model,
          audio.durationS,
        );
      } else {
        const original = originalCoach(db, dayId);
        if (!original?.row.reviewedAt) throw new Error('Review Take 1 first.');
        const result = await requestJson({
          ...config,
          audio,
          signal,
          schema: deltaSchema,
          system: deltaPrompt,
          data: {
            topic: day.brief,
            original_transcript: original.result.transcript,
            original_fixes: original.result.corrections,
          },
        });
        saveDelta(db, dayId, takeId, result, config.model);
      }
    } catch (error) {
      throw new Error(publicAiError(error));
    }
  });
}
export async function analyseWriting(db: AppDatabase, dayId: string, signal?: AbortSignal) {
  assertDayUnlocked(db, dayId);
  const config = await access(db),
    writing = loadWriting(db, dayId);
  if (!writing?.submittedAt) throw new Error('Submit your own writing first.');
  if (db.select().from(essayFeedback).where(eq(essayFeedback.essayId, writing.id)).get()) return;
  return exclusive(writing.id, async () => {
    try {
      const result = await requestJson({
        ...config,
        signal,
        schema: essaySchema,
        system: essayPrompt,
        data: { topic: writing.topic, mode: writing.mode, original_writing: writing.body },
      });
      if (result.corrections.some((item) => !writing.body.includes(item.quote)))
        throw new Error('Unsupported quote.');
      db.insert(essayFeedback)
        .values({
          id: newId('essay-feedback'),
          dayId,
          essayId: writing.id,
          model: config.model,
          promptVersion: 'essay-1',
          schemaVersion: 'essay-1',
          resultJson: result,
        })
        .run();
    } catch (error) {
      throw new Error(publicAiError(error));
    }
  });
}
export async function analyseFollowup(db: AppDatabase, dayId: string, signal?: AbortSignal) {
  const config = await access(db),
    attempt = getFollowupAttempt(db, dayId);
  if (!attempt?.selfAnswered || !attempt.take.filePath)
    throw new Error('Record your answer and complete the self-check first.');
  if (attempt.analysisState === 'complete') return;
  return exclusive(attempt.id, async () => {
    const audio = await extractAudio(attempt.take.filePath!);
    if (signal?.aborted) throw new Error('Analysis cancelled before upload.');
    try {
      const result = await requestJson({
        ...config,
        audio,
        signal,
        schema: followupSchema,
        system: followupPrompt,
        data: { question: attempt.question },
      });
      saveFollowupFeedback(db, dayId, result, config.model);
    } catch (error) {
      throw new Error(publicAiError(error));
    }
  });
}
