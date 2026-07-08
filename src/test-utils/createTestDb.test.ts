import { sql } from 'drizzle-orm';

import { createTestDb } from './createTestDb';

describe('createTestDb', () => {
  it('creates all tables from the migrations', async () => {
    const db = createTestDb();
    const tables = await db.get<{ count: number }>(
      sql`SELECT count(*) as count FROM sqlite_master WHERE type = 'table' AND name IN ('exercises','workout_templates','template_exercises','workouts','sets')`,
    );
    expect(tables?.count).toBe(5);
  });
});
