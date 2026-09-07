import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { essays } from '../schema';
import { assertDayUnlocked, completeDayIfEligible, loadDay } from './programme';
export function loadWriting(db: AppDatabase, dayId: string) {
  return db
    .select()
    .from(essays)
    .where(eq(essays.id, dayId + '-essay'))
    .get();
}
export function saveWriting(db: AppDatabase, dayId: string, body: string, submit = false) {
  const day = assertDayUnlocked(db, dayId);
  if (body.length > 20000) throw new Error('Keep this draft under 20,000 characters.');
  if (submit && !body.trim()) throw new Error('Write your response first.');
  const old = loadWriting(db, dayId);
  if (old?.submittedAt) throw new Error('Your submitted writing is preserved.');
  const values = {
    body,
    wordCount: body.trim() ? body.trim().split(/\s+/).length : 0,
    submittedAt: submit ? new Date() : null,
  };
  db.insert(essays)
    .values({
      id: dayId + '-essay',
      dayId,
      mode: day.writingMode,
      topic: loadDay(db, dayId).policy.essay || day.brief,
      ...values,
    })
    .onConflictDoUpdate({ target: essays.id, set: values })
    .run();
  if (submit) completeDayIfEligible(db, dayId);
}
