import { drizzle } from 'drizzle-orm/expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'take-two.db';

// The provider owns connection lifetime; importing this module performs no I/O.
export function createDatabaseClient(connection: SQLiteDatabase) {
  return drizzle(connection, { schema, logger: false });
}

export type AppDatabase = Omit<ReturnType<typeof createDatabaseClient>, '$client'>;
