import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { diary } from '../schema';
import { assertDayUnlocked } from './programme';
export type DiaryDraft = { did: string; learned: string; tomorrow: string; mood: number | null };
export function loadDiary(db: AppDatabase, dayId: string) {
  return db.select().from(diary).where(eq(diary.dayId, dayId)).get();
}
export function saveDiary(db: AppDatabase, dayId: string, draft: DiaryDraft) {
  assertDayUnlocked(db, dayId);
  if (draft.mood !== null && (!Number.isInteger(draft.mood) || draft.mood < 1 || draft.mood > 5))
    throw new Error('Choose a mood from 1 to 5.');
  if ([draft.did, draft.learned, draft.tomorrow].some((text) => text.length > 5000))
    throw new Error('Keep each reflection under 5,000 characters.');
  db.insert(diary)
    .values({ id: dayId + '-diary', dayId, ...draft })
    .onConflictDoUpdate({ target: diary.dayId, set: draft })
    .run();
}
