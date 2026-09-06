import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';

import { createdAt } from './columns';
import { days } from './programme';

export const essays = sqliteTable(
  'essays',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    mode: text('mode', { enum: ['long', 'compression'] }).notNull(),
    revision: integer('revision').notNull().default(1),
    topic: text('topic').notNull(),
    body: text('body').notNull().default(''),
    wordCount: integer('word_count').notNull().default(0),
    submittedAt: integer('submitted_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('essays_id_day').on(t.id, t.dayId),
    index('essays_day').on(t.dayId),
    check('essays_mode', sql`${t.mode} in ('long', 'compression')`),
    check('essays_revision', sql`${t.revision} >= 1`),
    check('essays_word_count', sql`${t.wordCount} >= 0`),
  ],
);

export const essayFeedback = sqliteTable(
  'essay_feedback',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    essayId: text('essay_id').notNull(),
    model: text('model').notNull(),
    promptVersion: text('prompt_version').notNull(),
    schemaVersion: text('schema_version').notNull(),
    score: real('score'),
    resultJson: text('result_json', { mode: 'json' }).$type<unknown>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('essay_feedback_day').on(t.dayId),
    index('essay_feedback_essay').on(t.essayId),
    foreignKey({ columns: [t.essayId, t.dayId], foreignColumns: [essays.id, essays.dayId] }),
    check('essay_feedback_score', sql`${t.score} between 1 and 10`),
    check('essay_feedback_json', sql`json_valid(${t.resultJson})`),
  ],
);
