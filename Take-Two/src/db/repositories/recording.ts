import { and, asc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { confidenceRatings, feedback, takes } from '../schema';
import { assertDayUnlocked, newId } from './programme';
import { loadPrep } from './prep';
export function dayTakes(db: AppDatabase, dayId: string) {
  return db
    .select()
    .from(takes)
    .where(eq(takes.taskId, dayId + '-core'))
    .orderBy(asc(takes.takeNo))
    .all();
}
export function confidenceBefore(db: AppDatabase, dayId: string) {
  return (
    db
      .select()
      .from(confidenceRatings)
      .where(eq(confidenceRatings.taskId, dayId + '-core'))
      .get()?.beforeConfidence ?? null
  );
}
export function saveConfidenceBefore(db: AppDatabase, dayId: string, value: number) {
  const day = assertDayUnlocked(db, dayId);
  if (dayTakes(db, dayId).length)
    throw new Error('The before-speaking rating is already recorded.');
  if (!Number.isInteger(value) || value < 1 || value > 5)
    throw new Error('Choose confidence from 1 to 5.');
  const values = { beforeConfidence: value, beforeRatedAt: new Date() };
  db.insert(confidenceRatings)
    .values({ id: dayId + '-confidence', dayId, taskId: day.taskId, ...values })
    .onConflictDoUpdate({ target: confidenceRatings.taskId, set: values })
    .run();
}
export function reserveTake(db: AppDatabase, dayId: string, destination: (id: string) => string) {
  return db.transaction((tx) => {
    const day = assertDayUnlocked(tx, dayId),
      prep = loadPrep(tx, dayId),
      previous = dayTakes(tx, dayId);
    if (day.policy.preparation && !prep.outline)
      throw new Error('Finish your thinking and outline first.');
    if (previous.some((take) => take.state === 'recording' || take.state === 'reserved'))
      throw new Error('A previous recording needs recovery before another starts.');
    if (previous.length >= 3)
      throw new Error('All three attempts have been used. A fourth take is not allowed.');
    const first = previous.find((take) => take.state === 'saved');
    if (
      first &&
      !tx
        .select()
        .from(feedback)
        .where(and(eq(feedback.takeId, first.id), eq(feedback.kind, 'coach')))
        .get()?.reviewedAt
    )
      throw new Error('Review the Take 1 critique before recording Take 2.');
    if (confidenceBefore(tx, dayId) === null)
      throw new Error('Rate your confidence before your first take.');
    const id = newId('take');
    tx.insert(takes)
      .values({
        id,
        dayId,
        taskId: day.taskId,
        takeNo: previous.length + 1,
        state: 'recording',
        filePath: destination(id),
        recordedAt: new Date(),
      })
      .run();
    return id;
  });
}
export function finishTake(
  db: AppDatabase,
  id: string,
  result: { filePath: string; bytes: number; durationS: number },
) {
  if (result.bytes <= 0 || result.durationS <= 0) throw new Error('This recording is empty.');
  db.update(takes)
    .set({ ...result, state: 'saved' })
    .where(and(eq(takes.id, id), eq(takes.state, 'recording')))
    .run();
}
export function failTake(db: AppDatabase, id: string) {
  db.update(takes)
    .set({ state: 'failed' })
    .where(and(eq(takes.id, id), eq(takes.state, 'recording')))
    .run();
}
