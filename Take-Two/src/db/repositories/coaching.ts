import { and, asc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { corrections, feedback, followups, vocab } from '../schema';
import { assertDayUnlocked, newId } from './programme';
import { dayTakes } from './recording';
import { coachSchema, overallScore, validateCoachResult, type CoachResult } from '@/services/gemini/coachSchema';
import { COACH_PROMPT_VERSION, COACH_RUBRIC_VERSION } from '@/services/gemini/coachPrompt';
import { deltaSchema, validateDelta, type DeltaResult } from '@/services/gemini/deltaPrompt';
export function takeFeedback(db: AppDatabase, takeId: string, kind: 'coach' | 'delta') {
  return db.select().from(feedback).where(and(eq(feedback.takeId, takeId), eq(feedback.kind, kind))).get();
}
export function originalCoach(db: AppDatabase, dayId: string) {
  const first = dayTakes(db, dayId).find(take => take.state === 'saved');
  const row = first && takeFeedback(db, first.id, 'coach');
  return row ? { row, result: coachSchema.parse(row.resultJson) } : null;
}
export function saveCoach(db: AppDatabase, dayId: string, takeId: string, raw: CoachResult, model: string, durationS: number) {
  const result = validateCoachResult(raw, durationS);
  return db.transaction(tx => {
    const day = assertDayUnlocked(tx, dayId);
    if (dayTakes(tx, dayId).find(take => take.state === 'saved')?.id !== takeId) throw new Error('Coach must analyse the first saved take.');
    if (takeFeedback(tx, takeId, 'coach')) return;
    const id = newId('feedback');
    tx.insert(feedback).values({ id, dayId, takeId, kind: 'coach', model, promptVersion: COACH_PROMPT_VERSION, schemaVersion: 'coach-1', rubricVersion: COACH_RUBRIC_VERSION, transcript: result.transcript, resultJson: result, overall: overallScore(result), structure: result.scores.structure, clarity: result.scores.clarity, wordChoice: result.scores.word_choice, pacePausing: result.scores.pace_pausing, flow: result.scores.flow, presence: result.scores.presence, paceWpm: result.transcript.trim().split(/\s+/).length / (durationS / 60) }).run();
    result.corrections.forEach((fix, i) => tx.insert(corrections).values({ id: id + '-' + fix.id, dayId, feedbackId: id, priority: i + 1, category: fix.category, atTimeS: fix.at_s, issue: fix.issue, fix: fix.fix }).run());
    tx.insert(followups).values({ id: dayId + '-followup', dayId, sourceTakeId: takeId, mode: day.policy.interaction, question: result.hidden_follow_up, promptVersion: COACH_PROMPT_VERSION }).run();
    if (result.word_for_today) tx.insert(vocab).values({ id: dayId + '-word', dayId, word: result.word_for_today.word, meaning: result.word_for_today.meaning, exampleSentence: result.word_for_today.use_it_here }).onConflictDoNothing().run();
  });
}
export function reviewCoach(db: AppDatabase, dayId: string) {
  assertDayUnlocked(db, dayId);
  const coach = originalCoach(db, dayId);
  if (!coach) throw new Error('Analyse Take 1 first.');
  db.update(feedback).set({ reviewedAt: new Date() }).where(eq(feedback.id, coach.row.id)).run();
}
export function saveDelta(db: AppDatabase, dayId: string, takeId: string, raw: DeltaResult, model: string) {
  const original = originalCoach(db, dayId);
  if (!original?.row.reviewedAt) throw new Error('Review Take 1 first.');
  const saved = dayTakes(db, dayId).filter(take => take.state === 'saved');
  if (!saved.slice(1).some(take => take.id === takeId)) throw new Error('A saved reshoot is required.');
  const result = validateDelta(raw, original.result);
  if (!takeFeedback(db, takeId, 'delta')) db.insert(feedback).values({ id: newId('delta'), dayId, takeId, kind: 'delta', model, promptVersion: 'delta-1', schemaVersion: 'delta-1', rubricVersion: COACH_RUBRIC_VERSION, transcript: result.transcript, resultJson: result }).run();
}
export function comparison(db: AppDatabase, dayId: string) {
  const saved = dayTakes(db, dayId).filter(take => take.state === 'saved');
  return saved.slice(1).map(take => { const row = takeFeedback(db, take.id, 'delta'); return { take, result: row ? deltaSchema.parse(row.resultJson) : null }; });
}
export function revealedFollowup(db: AppDatabase, dayId: string) {
  return db.select().from(followups).where(eq(followups.dayId, dayId)).orderBy(asc(followups.createdAt)).get();
}
export function revealFollowup(db: AppDatabase, dayId: string) {
  assertDayUnlocked(db, dayId);
  if (dayTakes(db, dayId).filter(take => take.state === 'saved').length < 2) throw new Error('Save Take 2 before revealing the question.');
  const item = revealedFollowup(db, dayId);
  if (!item) throw new Error('Analyse Take 1 first.');
  if (!item.revealedAt) db.update(followups).set({ revealedAt: new Date() }).where(eq(followups.id, item.id)).run();
  return revealedFollowup(db, dayId)!;
}
