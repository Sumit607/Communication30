import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { confidenceRatings, feedback, followupAttempts, followups, takes, taskInstances } from '../schema';
import { assertDayUnlocked, completeDayIfEligible, newId } from './programme';
import { dayTakes } from './recording';
import { followupSchema } from '@/services/gemini/followupPrompt';
export function reserveFollowup(db: AppDatabase, dayId: string, destination: (id: string) => string) {
  return db.transaction(tx => {
    assertDayUnlocked(tx, dayId);
    const question = tx.select().from(followups).where(eq(followups.dayId, dayId)).get();
    if (!question?.revealedAt || Date.now() - question.revealedAt.getTime() < 10000) throw new Error('Reveal the question and take ten seconds to think.');
    if (dayTakes(tx, dayId).filter(t => t.state === 'saved').length < 2) throw new Error('Save Take 2 first.');
    const taskId = dayId + '-live';
    if (tx.select().from(takes).where(eq(takes.taskId, taskId)).get()) throw new Error('Your Live Q attempt has already been used.');
    tx.insert(taskInstances).values({ id: taskId, dayId, ordinal: 100, kind: 'followup', topic: question.question, policyVersion: 'live-1' }).onConflictDoNothing().run();
    const id = newId('live');
    tx.insert(takes).values({ id, dayId, taskId, takeNo: 1, state: 'recording', filePath: destination(id), recordedAt: new Date() }).run();
    tx.insert(followupAttempts).values({ id: dayId + '-live-answer', dayId, taskId, takeId: id, followupId: question.id, question: question.question, thinkingTimeS: (Date.now() - question.revealedAt.getTime()) / 1000 }).run();
    return id;
  });
}
export function getFollowupAttempt(db: AppDatabase, dayId: string) {
  const item = db.select().from(followupAttempts).where(eq(followupAttempts.dayId, dayId)).get();
  if (!item) return null;
  const take = db.select().from(takes).where(eq(takes.id, item.takeId)).get();
  return take ? { ...item, take } : null;
}
export function saveSelfCheck(db: AppDatabase, dayId: string, value: 'yes' | 'partly' | 'no', confidence: number) {
  const attempt = getFollowupAttempt(db, dayId);
  if (!attempt || attempt.take.state !== 'saved') throw new Error('Save your Live Q recording first.');
  if (!['yes', 'partly', 'no'].includes(value) || !Number.isInteger(confidence) || confidence < 1 || confidence > 5) throw new Error('Complete both self-ratings.');
  if (attempt.selfAnswered) return;
  db.transaction(tx => {
    tx.update(followupAttempts).set({ selfAnswered: value, answeredAt: new Date() }).where(eq(followupAttempts.id, attempt.id)).run();
    tx.update(confidenceRatings).set({ afterLiveQConfidence: confidence, afterLiveQRatedAt: new Date(), followupAttemptId: attempt.id }).where(eq(confidenceRatings.taskId, dayId + '-core')).run();
  });
}
export function saveAfterConfidence(db: AppDatabase, dayId: string, value: number) {
  const saved = dayTakes(db, dayId).filter(t => t.state === 'saved');
  if (saved.length < 2 || !Number.isInteger(value) || value < 1 || value > 5) throw new Error('Save Take 2 and choose confidence from 1 to 5.');
  const existing = db.select().from(confidenceRatings).where(eq(confidenceRatings.taskId, dayId + '-core')).get();
  if (existing?.afterConfidence) return;
  db.update(confidenceRatings).set({ takeId: saved[0].id, afterTakeId: saved[1].id, afterConfidence: value, afterRatedAt: new Date() }).where(eq(confidenceRatings.taskId, dayId + '-core')).run();
}
export function saveFollowupFeedback(db: AppDatabase, dayId: string, raw: z.infer<typeof followupSchema>, model: string) {
  const result = followupSchema.parse(raw), item = getFollowupAttempt(db, dayId);
  if (!item?.selfAnswered || item.take.state !== 'saved') throw new Error('Complete the self-check first.');
  if (item.analysisState === 'complete') return;
  db.transaction(tx => {
    const id = newId('live-feedback');
    tx.insert(feedback).values({ id, dayId, takeId: item.takeId, kind: 'followup', model, promptVersion: 'live-1', schemaVersion: 'live-1', rubricVersion: 'qualitative-1', transcript: result.transcript, resultJson: result }).run();
    tx.update(followupAttempts).set({ feedbackId: id, analysisState: 'complete', answerTranscript: result.transcript, structureVerdict: result.structure, clarityVerdict: result.clarity, nextImprovement: result.next_improvement }).where(and(eq(followupAttempts.id, item.id), eq(followupAttempts.analysisState, item.analysisState))).run();
  });
  completeDayIfEligible(db, dayId);
}
