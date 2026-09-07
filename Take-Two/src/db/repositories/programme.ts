import { and, asc, desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { days, programmes, taskInstances, essays, feedback, followupAttempts, takes } from '../schema';
import { curriculum, policyFor } from '@/features/programme/curriculum';
export function newId(prefix: string) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
}
export function activeProgramme(db: AppDatabase) {
  return db.select().from(programmes).orderBy(desc(programmes.createdAt)).get();
}
export function programmeDays(db: AppDatabase) {
  const current = activeProgramme(db);
  return current
    ? db.select().from(days).where(eq(days.programmeId, current.id)).orderBy(asc(days.dayNo)).all()
    : [];
}
export function startProgramme(db: AppDatabase, now = new Date()) {
  const existing = activeProgramme(db);
  if (existing) return existing.id;
  const id = newId('programme');
  db.transaction((tx) => {
    tx.insert(programmes)
      .values({
        id,
        curriculumVersion: '1.6',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: now,
      })
      .run();
    for (const policy of curriculum) {
      const dayId = id + '-day-' + policy.dayNo;
      tx.insert(days)
        .values({
          id: dayId,
          programmeId: id,
          dayNo: policy.dayNo,
          brief: policy.topic,
          structureExpected: policy.structure,
          interactionMode: policy.interaction,
          writingMode: policy.writing,
        })
        .run();
      tx.insert(taskInstances)
        .values({
          id: dayId + '-core',
          dayId,
          ordinal: 1,
          kind: 'core',
          topic: policy.topic,
          policyVersion: '1.6-core-draft',
        })
        .run();
    }
  });
  return id;
}
export function loadDay(db: AppDatabase, dayId: string) {
  const day = db.select().from(days).where(eq(days.id, dayId)).get();
  if (!day) throw new Error('This practice day could not be found.');
  return { ...day, policy: policyFor(day.dayNo), taskId: day.id + '-core' };
}
export function assertDayUnlocked(db: AppDatabase, dayId: string) {
  const day = loadDay(db, dayId);
  if (programmeDays(db).some((item) => item.dayNo < day.dayNo && !item.completedAt))
    throw new Error('Complete the previous practice day first.');
  return day;
}

/** Complete only after the required speaking loop and writing are durably saved. Diary is optional. */
export function completeDayIfEligible(db: AppDatabase, dayId: string) {
  const day = loadDay(db, dayId);
  const saved = db.select().from(takes).where(eq(takes.taskId, day.taskId)).all().filter(take => take.state === 'saved');
  const first = saved[0], second = saved[1];
  const coached = first && db.select().from(feedback).where(and(eq(feedback.takeId, first.id), eq(feedback.kind, 'coach'))).get();
  const compared = second && db.select().from(feedback).where(and(eq(feedback.takeId, second.id), eq(feedback.kind, 'delta'))).get();
  const followup = db.select().from(followupAttempts).where(eq(followupAttempts.dayId, dayId)).get();
  const writing = db.select().from(essays).where(eq(essays.id, dayId + '-essay')).get();
  if (!first || !second || !coached || !compared || followup?.analysisState !== 'complete' || !writing?.submittedAt) return false;
  db.update(days).set({ completedAt: new Date() }).where(eq(days.id, dayId)).run();
  return true;
}
