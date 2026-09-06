import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import type { SQLiteDatabase } from 'expo-sqlite';

import migrations from '../../drizzle/migrations';
import { createDatabaseClient } from './client';

export async function initializeDatabase(connection: SQLiteDatabase): Promise<void> {
  connection.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  if (
    connection.getFirstSync<{ foreign_keys: number }>('PRAGMA foreign_keys')?.foreign_keys !== 1
  ) {
    throw new Error('Database constraints could not be enabled.');
  }
  await migrate(createDatabaseClient(connection), migrations);
  if (connection.getAllSync('PRAGMA foreign_key_check').length > 0) {
    throw new Error('Database integrity check failed.');
  }
  // No seeding of programme instances, progress, personal content or synthetic feedback.
}
