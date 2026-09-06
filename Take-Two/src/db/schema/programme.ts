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

export const programmes = sqliteTable('programmes', {
  id: text('id').primaryKey(),
  curriculumVersion: text('curriculum_version').notNull(),
  timezone: text('timezone').notNull(),
  createdAt: createdAt(),
});

export const days = sqliteTable(
  'days',
  {
    id: text('id').primaryKey(),
    programmeId: text('programme_id')
      .notNull()
      .references(() => programmes.id),
    dayNo: integer('day_no').notNull(),
    brief: text('brief').notNull(),
    structureExpected: text('structure_expected'),
    interactionMode: text('interaction_mode'),
    writingMode: text('writing_mode', { enum: ['long', 'compression'] }).notNull(),
    targetOverall: real('target_overall'),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('days_programme_number').on(t.programmeId, t.dayNo),
    check('days_number_range', sql`typeof(${t.dayNo}) = 'integer' and ${t.dayNo} between 1 and 30`),
    check('days_writing_mode', sql`${t.writingMode} in ('long', 'compression')`),
    check('days_target_range', sql`${t.targetOverall} between 1 and 10`),
  ],
);

export const taskInstances = sqliteTable(
  'task_instances',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    ordinal: integer('ordinal').notNull(),
    kind: text('kind', { enum: ['core', 'drill', 'followup'] }).notNull(),
    topic: text('topic').notNull(),
    policyVersion: text('policy_version').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique('tasks_id_day').on(t.id, t.dayId),
    unique('tasks_day_ordinal').on(t.dayId, t.ordinal),
    check('tasks_positive_ordinal', sql`${t.ordinal} >= 1`),
    check('tasks_kind', sql`${t.kind} in ('core', 'drill', 'followup')`),
  ],
);

export const thinking = sqliteTable(
  'thinking',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    taskId: text('task_id').notNull(),
    what: text('what').notNull().default(''),
    why: text('why').notNull().default(''),
    soWhat: text('so_what').notNull().default(''),
    myView: text('my_view').notNull().default(''),
    submittedAt: integer('submitted_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('thinking_task').on(t.taskId),
    index('thinking_day').on(t.dayId),
    foreignKey({
      columns: [t.taskId, t.dayId],
      foreignColumns: [taskInstances.id, taskInstances.dayId],
    }),
  ],
);

export const outlines = sqliteTable(
  'outlines',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    taskId: text('task_id').notNull(),
    structure: text('structure'),
    line1: text('line1').notNull().default(''),
    line2: text('line2').notNull().default(''),
    line3: text('line3').notNull().default(''),
    line4: text('line4').notNull().default(''),
    createdAt: createdAt(),
  },
  (t) => [
    unique('outlines_task').on(t.taskId),
    index('outlines_day').on(t.dayId),
    foreignKey({
      columns: [t.taskId, t.dayId],
      foreignColumns: [taskInstances.id, taskInstances.dayId],
    }),
  ],
);
