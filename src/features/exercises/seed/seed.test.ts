import { exercises, templateExercises, workoutTemplates } from '@/db/schema';
import { createTestDb } from '@/test-utils/createTestDb';

import { exerciseSeedData } from './exercises.seed';
import { seedDatabase } from './seed';
import { templateSeedData } from './templates.seed';

describe('seedDatabase', () => {
  it('seeds all exercises as non-custom and both example templates', async () => {
    const db = createTestDb();
    await seedDatabase(db);

    const seededExercises = await db.select().from(exercises);
    expect(seededExercises).toHaveLength(exerciseSeedData.length);
    expect(seededExercises.every((e) => e.isCustom === false)).toBe(true);

    const seededTemplates = await db.select().from(workoutTemplates);
    expect(seededTemplates.map((t) => t.name).sort()).toEqual(
      templateSeedData.map((t) => t.name).sort(),
    );

    const seededTemplateExercises = await db.select().from(templateExercises);
    const expectedCount = templateSeedData.reduce((sum, t) => sum + t.exercises.length, 0);
    expect(seededTemplateExercises).toHaveLength(expectedCount);
  });

  it('covers all 6 muscle groups', async () => {
    const db = createTestDb();
    await seedDatabase(db);

    const seededExercises = await db.select().from(exercises);
    const groups = new Set(seededExercises.map((e) => e.muscleGroup));
    expect(groups).toEqual(new Set(['brust', 'beine', 'ruecken', 'schultern', 'arme', 'core']));
  });

  it('is idempotent: running it twice does not duplicate rows', async () => {
    const db = createTestDb();
    await seedDatabase(db);
    await seedDatabase(db);

    const seededExercises = await db.select().from(exercises);
    expect(seededExercises).toHaveLength(exerciseSeedData.length);
  });

  it('does not reseed if a user already has (possibly modified) exercises', async () => {
    const db = createTestDb();
    await seedDatabase(db);

    const before = await db.select().from(exercises);

    // Simuliert einen zweiten App-Start nach Nutzeränderungen.
    await seedDatabase(db);

    const after = await db.select().from(exercises);
    expect(after).toHaveLength(before.length);
  });
});
