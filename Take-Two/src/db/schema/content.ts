import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createdAt } from './columns';
import { days } from './programme';

export const sources = sqliteTable(
  'sources',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    kind: text('kind', { enum: ['article', 'video'] }).notNull(),
    domain: text('domain').notNull(),
    feedUrl: text('feed_url'),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    check('sources_kind', sql`${t.kind} in ('article', 'video')`),
    check('sources_enabled', sql`${t.enabled} in (0, 1)`),
  ],
);

export const inputs = sqliteTable(
  'inputs',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    sourceId: text('source_id').references(() => sources.id),
    kind: text('kind', { enum: ['article', 'video'] }).notNull(),
    title: text('title').notNull(),
    url: text('url'),
    contentSnapshot: text('content_snapshot'),
    memoryFact: text('memory_fact'),
    shownAt: integer('shown_at', { mode: 'timestamp_ms' }),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [
    index('inputs_day').on(t.dayId),
    index('inputs_source').on(t.sourceId),
    check('inputs_kind', sql`${t.kind} in ('article', 'video')`),
  ],
);

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  domain: text('domain').notNull(),
  interactionFit: text('interaction_fit'),
  lastDrawnAt: integer('last_drawn_at', { mode: 'timestamp_ms' }),
  createdAt: createdAt(),
});

export const vocab = sqliteTable(
  'vocab',
  {
    id: text('id').primaryKey(),
    dayId: text('day_id')
      .notNull()
      .references(() => days.id),
    word: text('word').notNull(),
    meaning: text('meaning'),
    exampleSentence: text('example_sentence'),
    sourceUnderstoodAt: integer('source_understood_at', { mode: 'timestamp_ms' }),
    writingUsedAt: integer('writing_used_at', { mode: 'timestamp_ms' }),
    speakingUsedAt: integer('speaking_used_at', { mode: 'timestamp_ms' }),
    landedAt: integer('landed_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
  },
  (t) => [index('vocab_day').on(t.dayId)],
);

// Explicit preference columns avoid a catch-all store for credentials or personal context.
export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey().default(1),
    reminderHour: integer('reminder_hour').notNull().default(18),
    reminderMinute: integer('reminder_minute').notNull().default(0),
    recordingQuality: text('recording_quality').notNull().default('720p'),
    geminiModel: text('gemini_model'),
    diaryLockEnabled: integer('diary_lock_enabled', { mode: 'boolean' }).notNull().default(false),
    privacyAcknowledgedAt: integer('privacy_acknowledged_at', { mode: 'timestamp_ms' }),
  },
  (t) => [
    check('settings_singleton', sql`${t.id} = 1`),
    check('settings_hour', sql`${t.reminderHour} between 0 and 23`),
    check('settings_minute', sql`${t.reminderMinute} between 0 and 59`),
    check('settings_lock', sql`${t.diaryLockEnabled} in (0, 1)`),
  ],
);
