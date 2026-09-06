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
import { days, taskInstances } from './programme';

export const takes = sqliteTable(
  'takes',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    taskId: text('task_id').notNull(),
    // Physical slot, including aborted attempts. Coaching roles will be assigned by feature policies.
    takeNo: integer('take_no').notNull(),
    state: text('state', { enum: ['reserved', 'recording', 'saved', 'aborted', 'failed'] })
      .notNull()
      .default('reserved'),
    filePath: text('file_path'),
    durationS: real('duration_s'),
    bytes: integer('bytes'),
    recordedAt: integer('recorded_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('takes_task_slot').on(t.taskId, t.takeNo),
    unique('takes_id_day').on(t.id, t.dayId),
    unique('takes_id_day_task').on(t.id, t.dayId, t.taskId),
    index('takes_day').on(t.dayId),
    foreignKey({
      columns: [t.taskId, t.dayId],
      foreignColumns: [taskInstances.id, taskInstances.dayId],
    }),
    check('takes_slot_range', sql`typeof(${t.takeNo}) = 'integer' and ${t.takeNo} between 1 and 3`),
    check(
      'takes_state',
      sql`${t.state} in ('reserved', 'recording', 'saved', 'aborted', 'failed')`,
    ),
    check('takes_duration', sql`${t.durationS} >= 0`),
    check('takes_bytes', sql`${t.bytes} >= 0`),
  ],
);

export const feedback = sqliteTable(
  'feedback',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    takeId: text('take_id').notNull(),
    kind: text('kind', { enum: ['coach', 'delta', 'followup'] }).notNull(),
    model: text('model').notNull(),
    promptVersion: text('prompt_version').notNull(),
    schemaVersion: text('schema_version').notNull(),
    rubricVersion: text('rubric_version').notNull(),
    transcript: text('transcript'),
    overall: real('overall'),
    structure: real('structure'),
    clarity: real('clarity'),
    wordChoice: real('word_choice'),
    pacePausing: real('pace_pausing'),
    flow: real('flow'),
    presence: real('presence'),
    paceWpm: real('pace_wpm'),
    fillersPerMin: real('fillers_per_min'),
    // Future service must Zod-validate before inserting; a JSON column alone is not validation.
    resultJson: text('result_json', { mode: 'json' }).$type<unknown>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique('feedback_id_day').on(t.id, t.dayId),
    index('feedback_day').on(t.dayId),
    index('feedback_take').on(t.takeId),
    foreignKey({ columns: [t.takeId, t.dayId], foreignColumns: [takes.id, takes.dayId] }),
    check('feedback_kind', sql`${t.kind} in ('coach', 'delta', 'followup')`),
    check(
      'feedback_scores',
      sql`(${t.overall} is null or ${t.overall} between 1 and 10)
    and (${t.structure} is null or ${t.structure} between 1 and 10)
    and (${t.clarity} is null or ${t.clarity} between 1 and 10)
    and (${t.wordChoice} is null or ${t.wordChoice} between 1 and 10)
    and (${t.pacePausing} is null or ${t.pacePausing} between 1 and 10)
    and (${t.flow} is null or ${t.flow} between 1 and 10)
    and (${t.presence} is null or ${t.presence} between 1 and 10)`,
    ),
    check(
      'feedback_rates',
      sql`(${t.paceWpm} is null or ${t.paceWpm} >= 0)
    and (${t.fillersPerMin} is null or ${t.fillersPerMin} >= 0)`,
    ),
    check('feedback_json', sql`json_valid(${t.resultJson})`),
  ],
);

export const corrections = sqliteTable(
  'corrections',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    feedbackId: text('feedback_id').notNull(),
    priority: integer('priority').notNull(),
    category: text('category').notNull(),
    atTimeS: real('at_time_s'),
    issue: text('issue').notNull(),
    fix: text('fix').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('corrections_day').on(t.dayId),
    unique('corrections_feedback_priority').on(t.feedbackId, t.priority),
    foreignKey({ columns: [t.feedbackId, t.dayId], foreignColumns: [feedback.id, feedback.dayId] }),
    check(
      'corrections_max_three',
      sql`typeof(${t.priority}) = 'integer' and ${t.priority} between 1 and 3`,
    ),
    check('corrections_timestamp', sql`${t.atTimeS} >= 0`),
  ],
);

export const measurements = sqliteTable(
  'measurements',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    takeId: text('take_id').notNull(),
    algorithmVersion: text('algorithm_version').notNull(),
    resultJson: text('result_json', { mode: 'json' }).$type<unknown>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('measurements_day').on(t.dayId),
    index('measurements_take').on(t.takeId),
    foreignKey({ columns: [t.takeId, t.dayId], foreignColumns: [takes.id, takes.dayId] }),
    check('measurements_json', sql`json_valid(${t.resultJson})`),
  ],
);

export const followups = sqliteTable(
  'followups',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    sourceTakeId: text('source_take_id').notNull(),
    mode: text('mode').notNull(),
    question: text('question').notNull(),
    promptVersion: text('prompt_version').notNull(),
    revealedAt: integer('revealed_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('followups_id_day').on(t.id, t.dayId),
    index('followups_day').on(t.dayId),
    index('followups_source_take').on(t.sourceTakeId),
    foreignKey({ columns: [t.sourceTakeId, t.dayId], foreignColumns: [takes.id, takes.dayId] }),
  ],
);

export const followupAttempts = sqliteTable(
  'followup_attempts',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    taskId: text('task_id').notNull(),
    takeId: text('take_id').notNull(),
    followupId: text('followup_id').notNull(),
    question: text('question').notNull(),
    answerTranscript: text('answer_transcript'),
    thinkingTimeS: real('thinking_time_s'),
    selfAnswered: text('self_answered', { enum: ['yes', 'partly', 'no'] }),
    structureVerdict: text('structure_verdict'),
    clarityVerdict: text('clarity_verdict'),
    nextImprovement: text('next_improvement'),
    score: real('score'),
    scoreRubricVersion: text('score_rubric_version'),
    analysisState: text('analysis_state', {
      enum: ['not_requested', 'pending', 'complete', 'failed'],
    })
      .notNull()
      .default('not_requested'),
    feedbackId: text('feedback_id'),
    answeredAt: integer('answered_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('followup_attempts_take').on(t.takeId),
    unique('followup_attempts_id_day').on(t.id, t.dayId),
    index('followup_attempts_day').on(t.dayId),
    index('followup_attempts_parent').on(t.followupId),
    foreignKey({
      columns: [t.takeId, t.dayId, t.taskId],
      foreignColumns: [takes.id, takes.dayId, takes.taskId],
    }),
    foreignKey({
      columns: [t.followupId, t.dayId],
      foreignColumns: [followups.id, followups.dayId],
    }),
    foreignKey({ columns: [t.feedbackId, t.dayId], foreignColumns: [feedback.id, feedback.dayId] }),
    check('followup_thinking_time', sql`${t.thinkingTimeS} >= 0`),
    check('followup_self_check', sql`${t.selfAnswered} in ('yes', 'partly', 'no')`),
    check(
      'followup_score_provenance',
      sql`${t.score} is null or length(trim(${t.scoreRubricVersion})) > 0 and ${t.scoreRubricVersion} is not null`,
    ),
    check(
      'followup_analysis_state',
      sql`${t.analysisState} in ('not_requested', 'pending', 'complete', 'failed')`,
    ),
  ],
);
