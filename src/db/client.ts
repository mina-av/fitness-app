import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

const DATABASE_NAME = 'fitness.db';

const expoDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db: AppDatabase = drizzle(expoDb, { schema });
