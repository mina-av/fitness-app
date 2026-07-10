import { eq } from 'drizzle-orm';

import { exercises, templateExercises, workoutTemplates } from '@/db/schema';
import { createId } from '@/lib/ids';
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

  it('adds newly-added seed exercises to an already-seeded (older) install', async () => {
    const db = createTestDb();
    const now = new Date();

    // Simuliert eine bestehende Installation mit einer älteren, kleineren
    // Version der Übungsbibliothek (nur die ersten 5 Einträge).
    const preExisting = exerciseSeedData.slice(0, 5);
    const preExistingIds = new Map<string, string>();
    for (const data of preExisting) {
      const id = createId();
      preExistingIds.set(data.name, id);
      await db.insert(exercises).values({
        id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        name: data.name,
        muscleGroup: data.muscleGroup,
        secondaryMuscles: null,
        equipment: data.equipment,
        description: data.description,
        mediaUrl: null,
        isCustom: false,
      });
    }

    await seedDatabase(db);

    const all = await db.select().from(exercises);
    expect(all).toHaveLength(exerciseSeedData.length);

    // Bereits vorhandene Übungen behalten ihre ursprüngliche ID (kein Duplikat/Ersatz).
    for (const [name, id] of preExistingIds) {
      const match = all.find((e) => e.name === name);
      expect(match?.id).toBe(id);
    }
  });

  it('does not resurrect a user-archived (soft-deleted) standard exercise', async () => {
    const db = createTestDb();
    const now = new Date();
    const target = exerciseSeedData[0];

    await db.insert(exercises).values({
      id: createId(),
      createdAt: now,
      updatedAt: now,
      deletedAt: now, // vom Nutzer archiviert
      name: target.name,
      muscleGroup: target.muscleGroup,
      secondaryMuscles: null,
      equipment: target.equipment,
      description: target.description,
      mediaUrl: null,
      isCustom: false,
    });

    await seedDatabase(db);

    const matches = await db.select().from(exercises).where(eq(exercises.name, target.name));
    expect(matches).toHaveLength(1);
    expect(matches[0].deletedAt).not.toBeNull();
  });

  it('does not reseed example templates if the user already has any template', async () => {
    const db = createTestDb();
    const now = new Date();
    await db.insert(workoutTemplates).values({
      id: createId(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      name: 'Mein eigener Plan',
      note: null,
      position: 0,
    });

    await seedDatabase(db);

    const allTemplates = await db.select().from(workoutTemplates);
    expect(allTemplates.map((t) => t.name)).toEqual(['Mein eigener Plan']);

    // Übungen werden trotzdem ergänzt.
    const allExercises = await db.select().from(exercises);
    expect(allExercises).toHaveLength(exerciseSeedData.length);
  });
});
