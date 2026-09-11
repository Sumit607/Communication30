import { mkdtempSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import { createDatabaseClient } from '@/db/client';
import { initializeDatabase } from '@/db/initialize';
import { days } from '@/db/schema';

import { createTestConnection } from '../fixtures/sqlite-connection';

let database: ReturnType<typeof createTestConnection>;

beforeEach(async () => {
  database = createTestConnection();
  await initializeDatabase(database.connection);
});

afterEach(() => database.sqlite.close());

function createDayAndTask(day = 'day-1', task = 'core-1', dayNo = 1) {
  database.sqlite
    .prepare('INSERT OR IGNORE INTO programmes (id, curriculum_version, timezone) VALUES (?, ?, ?)')
    .run('test-programme', 'fixture', 'Asia/Kolkata');
  database.sqlite
    .prepare(
      'INSERT INTO days (id, programme_id, day_no, brief, writing_mode) VALUES (?, ?, ?, ?, ?)',
    )
    .run(day, 'test-programme', dayNo, 'Synthetic test task', 'long');
  database.sqlite
    .prepare(
      'INSERT INTO task_instances (id, day_id, ordinal, kind, topic, policy_version) VALUES (?, ?, 1, ?, ?, ?)',
    )
    .run(task, day, 'core', 'Synthetic test topic', 'fixture');
}

function addTake(id: string, slot: number, task = 'core-1', day = 'day-1') {
  database.sqlite
    .prepare('INSERT INTO takes (id, day_id, task_id, take_no) VALUES (?, ?, ?, ?)')
    .run(id, day, task, slot);
}

test('startup applies all 20 tables with constraints enabled and no seeded user data', () => {
  const tables = database.sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'",
    )
    .all();
  expect(tables).toHaveLength(20);
  for (const { name } of tables) {
    expect(database.sqlite.prepare(`SELECT count(*) AS count FROM "${name}"`).get()?.count).toBe(0);
  }
  expect(database.sqlite.prepare('PRAGMA foreign_keys').get()?.foreign_keys).toBe(1);
  expect(database.sqlite.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
  expect(createDatabaseClient(database.connection).select().from(days).all()).toEqual([]);
});

test('reinitializing does not replay migrations or erase local records', async () => {
  createDayAndTask();
  const migrationsBefore = database.sqlite
    .prepare('SELECT * FROM __drizzle_migrations ORDER BY id')
    .all();
  expect(migrationsBefore.length).toBeGreaterThan(0);
  await initializeDatabase(database.connection);
  expect(database.sqlite.prepare('SELECT * FROM __drizzle_migrations ORDER BY id').all()).toEqual(
    migrationsBefore,
  );
  expect(
    createDatabaseClient(database.connection).select().from(days).all()[0].completedAt,
  ).toBeNull();
});

test('take slots are unique, capped at three, and scoped to an exercise', () => {
  createDayAndTask();
  addTake('take-1', 1);
  addTake('take-2', 2);
  addTake('take-3', 3);
  expect(() => addTake('take-4', 4)).toThrow();
  expect(() => addTake('fractional-slot', 1.5)).toThrow();
  expect(() => addTake('duplicate', 1)).toThrow();
  database.sqlite
    .prepare(
      'INSERT INTO task_instances (id, day_id, ordinal, kind, topic, policy_version) VALUES (?, ?, 2, ?, ?, ?)',
    )
    .run('drill-1', 'day-1', 'drill', 'Another exercise', 'fixture');
  addTake('drill-take', 1, 'drill-1');
});

test('cross-day task and feedback references are rejected', () => {
  createDayAndTask();
  createDayAndTask('day-2', 'core-2', 2);
  expect(() => addTake('bad', 1, 'core-1', 'day-2')).toThrow();
  addTake('take-1', 1);
  expect(() =>
    database.sqlite
      .prepare(
        'INSERT INTO feedback (id, day_id, take_id, kind, model, prompt_version, schema_version, rubric_version, result_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        'feedback-1',
        'day-2',
        'take-1',
        'coach',
        'fixture',
        'fixture',
        'fixture',
        'fixture',
        '{}',
      ),
  ).toThrow();
});

test('confidence can precede recording; missing and invalid checkpoints stay distinct', () => {
  createDayAndTask();
  database.sqlite
    .prepare(
      'INSERT INTO confidence_ratings (id, day_id, task_id, before_confidence, before_rated_at) VALUES (?, ?, ?, 3, 1000)',
    )
    .run('confidence-1', 'day-1', 'core-1');
  expect(
    database.sqlite
      .prepare('SELECT take_id, after_confidence, after_live_q_confidence FROM confidence_ratings')
      .get(),
  ).toEqual({ take_id: null, after_confidence: null, after_live_q_confidence: null });
  expect(() =>
    database.sqlite.exec('UPDATE confidence_ratings SET before_confidence = 6'),
  ).toThrow();
  expect(() =>
    database.sqlite.exec('UPDATE confidence_ratings SET before_confidence = 3.5'),
  ).toThrow();
  expect(() =>
    database.sqlite.exec('UPDATE confidence_ratings SET after_confidence = 4'),
  ).toThrow();
  addTake('take-1', 1);
  addTake('take-2', 2);
  database.sqlite.exec(
    "UPDATE confidence_ratings SET take_id = 'take-1', after_take_id = 'take-2', after_confidence = 4, after_rated_at = 2000",
  );
});

test('thinking starts blank and writing feedback cannot refer to another day', () => {
  createDayAndTask();
  createDayAndTask('day-2', 'core-2', 2);
  database.sqlite.exec(
    "INSERT INTO thinking (id, day_id, task_id) VALUES ('think-1', 'day-1', 'core-1')",
  );
  expect(
    database.sqlite.prepare('SELECT what, why, so_what, my_view, submitted_at FROM thinking').get(),
  ).toEqual({ what: '', why: '', so_what: '', my_view: '', submitted_at: null });
  database.sqlite.exec(
    "INSERT INTO essays (id, day_id, mode, topic) VALUES ('essay-1', 'day-1', 'compression', 'Fixture')",
  );
  expect(() =>
    database.sqlite.exec(
      "INSERT INTO essay_feedback (id, day_id, essay_id, model, prompt_version, schema_version, result_json) VALUES ('ef', 'day-2', 'essay-1', 'fixture', 'fixture', 'fixture', '{}')",
    ),
  ).toThrow();
});

test('hidden questions persist without attempts; scores require a rubric and timing cannot be negative', () => {
  createDayAndTask();
  addTake('source-take', 1);
  database.sqlite.exec(
    "INSERT INTO followups (id, day_id, source_take_id, mode, question, prompt_version) VALUES ('q', 'day-1', 'source-take', 'followup', 'Why?', 'fixture')",
  );
  expect(
    database.sqlite.prepare('SELECT revealed_at FROM followups').get()?.revealed_at,
  ).toBeNull();
  database.sqlite.exec(
    "INSERT INTO task_instances (id, day_id, ordinal, kind, topic, policy_version) VALUES ('live-q', 'day-1', 2, 'followup', 'Why?', 'fixture')",
  );
  addTake('response-take', 1, 'live-q');
  database.sqlite.exec(
    "INSERT INTO followup_attempts (id, day_id, task_id, take_id, followup_id, question) VALUES ('response', 'day-1', 'live-q', 'response-take', 'q', 'Why?')",
  );
  expect(
    database.sqlite.prepare('SELECT score, answer_transcript FROM followup_attempts').get(),
  ).toEqual({ score: null, answer_transcript: null });
  expect(() => database.sqlite.exec('UPDATE followup_attempts SET thinking_time_s = -1')).toThrow();
  expect(() => database.sqlite.exec('UPDATE followup_attempts SET score = 3')).toThrow();
});

test('corrections allow fewer than three but cannot store a fourth priority', () => {
  createDayAndTask();
  addTake('take-1', 1);
  database.sqlite.exec(
    "INSERT INTO feedback (id, day_id, take_id, kind, model, prompt_version, schema_version, rubric_version, result_json) VALUES ('f', 'day-1', 'take-1', 'coach', 'fixture', 'fixture', 'fixture', 'fixture', '{}')",
  );
  const insert = database.sqlite.prepare(
    'INSERT INTO corrections (id, day_id, feedback_id, priority, category, issue, fix) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const priority of [1, 2, 3])
    insert.run(`c-${priority}`, 'day-1', 'f', priority, 'structure', 'Fixture', 'Fixture');
  expect(() => insert.run('c-4', 'day-1', 'f', 4, 'structure', 'Fixture', 'Fixture')).toThrow();
});

test('failed migrations roll back their changes without resetting existing data', async () => {
  createDayAndTask();
  const db = createDatabaseClient(database.connection);
  const broken = {
    journal: {
      entries: [{ idx: 0, when: Date.now() + 86400000, tag: 'broken-fixture', breakpoints: true }],
    },
    migrations: {
      m0000: 'CREATE TABLE should_rollback (id TEXT);--> statement-breakpoint INVALID SQL;',
    },
  };
  await expect(migrate(db, broken)).rejects.toThrow();
  expect(db.get(sql`SELECT count(*) AS count FROM days`)).toEqual({ count: 1 });
  expect(
    database.sqlite.prepare("SELECT name FROM sqlite_master WHERE name = 'should_rollback'").get(),
  ).toBeUndefined();
});

test('file-backed SQLite survives close/reopen with migration history and user values intact', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'take-two-sqlite-test-'));
  const filename = join(directory, 'test.db');
  let fileDb = createTestConnection(filename);
  try {
    await initializeDatabase(fileDb.connection);
    fileDb.sqlite.exec('INSERT INTO settings (id, reminder_hour) VALUES (1, 19)');
    fileDb.sqlite.close();
    fileDb = createTestConnection(filename);
    await initializeDatabase(fileDb.connection);
    expect(fileDb.sqlite.prepare('SELECT reminder_hour FROM settings').get()?.reminder_hour).toBe(
      19,
    );
  } finally {
    fileDb.sqlite.close();
    // Only this test-created directory and its direct SQLite files may be removed.
    for (const entry of readdirSync(directory)) {
      const target = resolve(directory, entry);
      if (
        !target.startsWith(resolve(directory) + '\\') &&
        !target.startsWith(resolve(directory) + '/')
      ) {
        throw new Error('Unexpected test cleanup path');
      }
      unlinkSync(target);
    }
    rmdirSync(directory);
  }
});
