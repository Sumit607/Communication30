import { sql } from 'drizzle-orm';
import { integer } from 'drizzle-orm/sqlite-core';

export const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(strftime('%s', 'now') as integer) * 1000)`);
