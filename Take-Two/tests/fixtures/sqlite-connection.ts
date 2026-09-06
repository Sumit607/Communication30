import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

// Real desktop SQLite behind the narrow Expo connection methods used by Drizzle.
// This validates SQL and startup logic, not Android's native bridge or filesystem.
export function createTestConnection(filename = ':memory:') {
  const sqlite = new DatabaseSync(filename);
  const adapter = {
    execSync: (query: string) => sqlite.exec(query),
    getFirstSync: (query: string) => sqlite.prepare(query).get() ?? null,
    getAllSync: (query: string) => sqlite.prepare(query).all(),
    prepareSync(query: string) {
      return {
        executeSync(params: SQLInputValue[]) {
          const statement = sqlite.prepare(query);
          if (statement.columns().length > 0) {
            const rows = statement.all(...params);
            return { getAllSync: () => rows, getFirstSync: () => rows[0] ?? null };
          }
          const result = statement.run(...params);
          return {
            changes: Number(result.changes),
            lastInsertRowId: Number(result.lastInsertRowid),
          };
        },
        executeForRawResultSync(params: SQLInputValue[]) {
          const statement = sqlite.prepare(query);
          statement.setReturnArrays(true);
          const rows = statement.all(...params);
          return { getAllSync: () => rows };
        },
      };
    },
  };
  return { sqlite, connection: adapter as unknown as SQLiteDatabase };
}
