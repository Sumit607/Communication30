import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { inputs, outlines, thinking } from '../schema';
import { assertDayUnlocked, loadDay } from './programme';
import type { ThinkingDraft } from '@/types/thinking';
export function loadPrep(db: AppDatabase, dayId: string) {
  const day = loadDay(db, dayId);
  return {
    day,
    input: db.select().from(inputs).where(eq(inputs.dayId, dayId)).get(),
    thinking: db.select().from(thinking).where(eq(thinking.taskId, day.taskId)).get(),
    outline: db.select().from(outlines).where(eq(outlines.taskId, day.taskId)).get(),
  };
}
export function completeInput(
  db: AppDatabase,
  dayId: string,
  title: string,
  content: string,
  memoryFact: string,
) {
  assertDayUnlocked(db, dayId);
  if (!content.trim() || !memoryFact.trim())
    throw new Error('Read the input and save one fact first.');
  if (loadPrep(db, dayId).thinking?.submittedAt)
    throw new Error('The input for submitted thinking cannot be replaced.');
  db.insert(inputs)
    .values({
      id: dayId + '-input',
      dayId,
      title,
      kind: 'article',
      contentSnapshot: content,
      memoryFact,
      shownAt: new Date(),
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: inputs.id,
      set: { title, contentSnapshot: content, memoryFact, completedAt: new Date() },
    })
    .run();
}
export function saveThinking(db: AppDatabase, dayId: string, draft: ThinkingDraft, submit = false) {
  const day = assertDayUnlocked(db, dayId),
    existing = loadPrep(db, dayId);
  if (!existing.input?.completedAt) throw new Error('Finish your input before thinking.');
  if (existing.thinking?.submittedAt) throw new Error('Submitted thinking is preserved.');
  if (submit && Object.values(draft).some((value) => !value.trim()))
    throw new Error('Write your own response in all four boxes.');
  if (Object.values(draft).some((value) => value.length > 3000))
    throw new Error('Keep each thought under 3,000 characters.');
  const values = { ...draft, submittedAt: submit ? new Date() : null };
  db.insert(thinking)
    .values({ id: dayId + '-thinking', dayId, taskId: day.taskId, ...values })
    .onConflictDoUpdate({ target: thinking.taskId, set: values })
    .run();
}
export function saveOutline(db: AppDatabase, dayId: string, lines: string[]) {
  const day = assertDayUnlocked(db, dayId);
  if (!loadPrep(db, dayId).thinking?.submittedAt)
    throw new Error('Submit your own thinking first.');
  if (
    lines.length !== 4 ||
    lines.some((value) => !value.trim() || value.trim().split(/\s+/).length > 8)
  )
    throw new Error('Use four short lines, at most eight words each.');
  const values = {
    line1: lines[0],
    line2: lines[1],
    line3: lines[2],
    line4: lines[3],
    structure: day.structureExpected,
  };
  db.insert(outlines)
    .values({ id: dayId + '-outline', dayId, taskId: day.taskId, ...values })
    .onConflictDoUpdate({ target: outlines.taskId, set: values })
    .run();
}
