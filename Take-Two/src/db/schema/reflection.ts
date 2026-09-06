import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';

import { createdAt } from './columns';
import { days, taskInstances } from './programme';
import { followupAttempts, takes } from './speaking';

export const diary = sqliteTable(
  'diary',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    did: text('did').notNull().default(''),
    learned: text('learned').notNull().default(''),
    tomorrow: text('tomorrow').notNull().default(''),
    mood: integer('mood'),
    createdAt: createdAt(),
  },
  (t) => [
    unique('diary_day').on(t.dayId),
    check(
      'diary_mood',
      sql`${t.mood} is null or (typeof(${t.mood}) = 'integer' and ${t.mood} between 1 and 5)`,
    ),
  ],
);

export const confidenceRatings = sqliteTable(
  'confidence_ratings',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    taskId: text('task_id').notNull(),
    takeId: text('take_id'),
    afterTakeId: text('after_take_id'),
    followupAttemptId: text('followup_attempt_id'),
    beforeConfidence: integer('before_confidence'),
    afterConfidence: integer('after_confidence'),
    afterLiveQConfidence: integer('after_live_q_confidence'),
    beforeRatedAt: integer('before_rated_at', { mode: 'timestamp_ms' }),
    afterRatedAt: integer('after_rated_at', { mode: 'timestamp_ms' }),
    afterLiveQRatedAt: integer('after_live_q_rated_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  },
  (t) => [
    unique('confidence_task').on(t.taskId),
    index('confidence_day').on(t.dayId),
    foreignKey({
      columns: [t.taskId, t.dayId],
      foreignColumns: [taskInstances.id, taskInstances.dayId],
    }),
    foreignKey({
      columns: [t.takeId, t.dayId, t.taskId],
      foreignColumns: [takes.id, takes.dayId, takes.taskId],
    }),
    foreignKey({
      columns: [t.afterTakeId, t.dayId, t.taskId],
      foreignColumns: [takes.id, takes.dayId, takes.taskId],
    }),
    foreignKey({
      columns: [t.followupAttemptId, t.dayId],
      foreignColumns: [followupAttempts.id, followupAttempts.dayId],
    }),
    check(
      'confidence_before_range',
      sql`${t.beforeConfidence} is null or (typeof(${t.beforeConfidence}) = 'integer' and ${t.beforeConfidence} between 1 and 5)`,
    ),
    check(
      'confidence_after_range',
      sql`${t.afterConfidence} is null or (typeof(${t.afterConfidence}) = 'integer' and ${t.afterConfidence} between 1 and 5)`,
    ),
    check(
      'confidence_live_q_range',
      sql`${t.afterLiveQConfidence} is null or (typeof(${t.afterLiveQConfidence}) = 'integer' and ${t.afterLiveQConfidence} between 1 and 5)`,
    ),
    check(
      'confidence_before_time',
      sql`(${t.beforeConfidence} is null) = (${t.beforeRatedAt} is null)`,
    ),
    check(
      'confidence_after_time',
      sql`(${t.afterConfidence} is null) = (${t.afterRatedAt} is null)`,
    ),
    check(
      'confidence_live_q_time',
      sql`(${t.afterLiveQConfidence} is null) = (${t.afterLiveQRatedAt} is null)`,
    ),
    check(
      'confidence_after_take',
      sql`${t.afterConfidence} is null or ${t.afterTakeId} is not null`,
    ),
    check(
      'confidence_live_q_attempt',
      sql`${t.afterLiveQConfidence} is null or ${t.followupAttemptId} is not null`,
    ),
  ],
);
