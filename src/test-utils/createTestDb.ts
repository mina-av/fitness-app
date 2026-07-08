import { readFileSync } from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import type { AppDatabase } from '../db/client';
import * as schema from '../db/schema';

/**
 * Erzeugt eine In-Memory-SQLite-DB für Tests, mit dem realen Migrations-SQL
 * aus `drizzle/` befüllt (gleicher SQLite-Dialekt wie expo-sqlite zur
 * Laufzeit). Der better-sqlite3-Treiber ist synchron, expo-sqlite asynchron;
 * beide Drizzle-Query-Builder sind awaitable, daher ist der Cast auf
 * `AppDatabase` für Repository-Tests unproblematisch.
 */
export function createTestDb(): AppDatabase {
  const sqlite = new Database(':memory:');
  const migrationsDir = path.join(__dirname, '../../drizzle');
  const journal = JSON.parse(readFileSync(path.join(migrationsDir, 'meta/_journal.json'), 'utf-8'));

  for (const entry of journal.entries) {
    const sql = readFileSync(path.join(migrationsDir, `${entry.tag}.sql`), 'utf-8');
    sqlite.exec(sql);
  }

  return drizzle(sqlite, { schema }) as unknown as AppDatabase;
}
