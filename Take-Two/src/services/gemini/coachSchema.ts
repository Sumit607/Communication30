import { z } from 'zod';
const score = z.number().min(1).max(10);
const short = z.string().trim().min(1).max(500);
export const coachSchema = z
  .object({
    scores: z
      .object({
        structure: score,
        clarity: score,
        word_choice: score,
        pace_pausing: score,
        flow: score,
        presence: score,
      })
      .strict(),
    transcript: z.string().min(1).max(60000),
    strength: short,
    corrections: z
      .array(
        z
          .object({
            id: z.string().regex(/^fix-[1-3]$/),
            category: z.enum(['structure', 'flow', 'delivery']),
            at_s: z.number().nonnegative(),
            quote: short,
            issue: short,
            fix: short,
          })
          .strict(),
      )
      .max(3),
    say_this_instead: z.object({ you_said: short, instead: short }).strict().nullable(),
    word_for_today: z
      .object({ word: short, meaning: short, use_it_here: short })
      .strict()
      .nullable(),
    angle_you_missed: short.nullable(),
    hidden_follow_up: short,
    reshoot_brief: z
      .array(z.object({ correction_id: z.string(), instruction: short }).strict())
      .max(3),
  })
  .strict();
export type CoachResult = z.infer<typeof coachSchema>;
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
export function validateCoachResult(raw: unknown, durationS: number): CoachResult {
  if (!Number.isFinite(durationS) || durationS <= 0)
    throw new Error('Audio duration is unavailable.');
  const result = coachSchema.parse(raw),
    ids = result.corrections.map((fix) => fix.id);
  if (new Set(ids).size !== ids.length) throw new Error('Correction identifiers are duplicated.');
  if (
    result.corrections.some(
      (fix) => fix.at_s > durationS || !normalize(result.transcript).includes(normalize(fix.quote)),
    )
  )
    throw new Error('A correction cites unsupported evidence.');
  if (
    result.reshoot_brief.length !== ids.length ||
    result.reshoot_brief.some(
      (brief, i) =>
        brief.correction_id !== ids[i] || brief.instruction !== result.corrections[i].fix,
    )
  )
    throw new Error('The reshoot brief must repeat the original fixes.');
  if (
    result.say_this_instead &&
    !normalize(result.transcript).includes(normalize(result.say_this_instead.you_said))
  )
    throw new Error('The replacement phrase was not found in the transcript.');
  const visible = JSON.stringify({ ...result, hidden_follow_up: undefined });
  if (normalize(visible).includes(normalize(result.hidden_follow_up)))
    throw new Error('The hidden follow-up leaked into visible feedback.');
  return result;
}
export function overallScore(result: CoachResult) {
  return Math.round((Object.values(result.scores).reduce((a, b) => a + b, 0) / 6) * 10) / 10;
}
export function visibleCoach(result: CoachResult) {
  const { hidden_follow_up: _, ...visible } = result;
  return visible;
}
