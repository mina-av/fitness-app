import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';

import * as schema from './schema';

export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

const DATABASE_NAME = 'fitness.db';

/**
 * Definite-assignment-Assertion: `db` wird erst nach `initDb()` zugewiesen.
 * Alle Repository-Hooks importieren `db` weiterhin als einfache, synchrone
 * Konstante — der App-Root (app/_layout.tsx) garantiert per Render-Gating,
 * dass keine Komponente vor Abschluss von `initDb()` gemountet wird, die
 * `db` verwendet.
 */
export let db!: AppDatabase;

let initPromise: Promise<AppDatabase> | null = null;

/**
 * Öffnet die DB asynchron (`openDatabaseAsync`). Bewusst NICHT `openDatabaseSync`:
 * im Web basiert die synchrone Variante auf einer SharedArrayBuffer/Atomics-
 * Bridge zu einem Worker, die dort zuverlässig mit "Sync operation timeout"
 * fehlschlägt (siehe docs/decisions.md). Nativ (iOS/Android) macht das keinen
 * Unterschied — dort läuft ohnehin kein Sync-Bridge-Layer.
 */
export function initDb(): Promise<AppDatabase> {
  if (!initPromise) {
    initPromise = openDatabaseAsync(DATABASE_NAME, { enableChangeListener: true }).then(
      (expoDb) => {
        db = drizzle(expoDb, { schema });
        return db;
      },
    );
  }
  return initPromise;
}
