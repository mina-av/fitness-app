import { exercises, sets, workouts } from '@/db/schema';
import { createId } from '@/lib/ids';
import { createTestDb } from '@/test-utils/createTestDb';

import { exerciseHistoryQuery, setsForWorkoutQuery } from './repository';

/**
 * Lädt 1.000+ Sätze über mehrere Workouts, um sicherzustellen, dass die
 * Logging-relevanten Queries (Abnahme-Kriterium Phase 6: "Logging-Screen
 * flüssig bei 1.000+ Sätzen") die vorhandenen Indizes nutzen und nicht
 * linear mit der Gesamtdatenmenge langsamer werden.
 */
async function seedLargeDataset(db: ReturnType<typeof createTestDb>) {
  const now = new Date();
  const exercise = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name: 'Bankdrücken',
    muscleGroup: 'brust' as const,
    isCustom: false,
  };
  await db.insert(exercises).values(exercise);

  const WORKOUT_COUNT = 100;
  const SETS_PER_WORKOUT = 12; // 1.200 Sätze insgesamt

  const workoutRows = Array.from({ length: WORKOUT_COUNT }, (_, i) => ({
    id: createId(),
    createdAt: new Date(now.getTime() + i * 1000),
    updatedAt: new Date(now.getTime() + i * 1000),
    deletedAt: null,
    date: new Date(now.getTime() + i * 86_400_000),
    templateId: null,
    note: null,
    finishedAt: new Date(now.getTime() + i * 86_400_000 + 3_600_000),
  }));
  await db.insert(workouts).values(workoutRows);

  const setRows = workoutRows.flatMap((workout, workoutIndex) =>
    Array.from({ length: SETS_PER_WORKOUT }, (_, setIndex) => ({
      id: createId(),
      createdAt: new Date(workout.date.getTime() + setIndex * 60_000),
      updatedAt: new Date(workout.date.getTime() + setIndex * 60_000),
      deletedAt: null,
      workoutId: workout.id,
      exerciseId: exercise.id,
      setNumber: setIndex + 1,
      reps: 8,
      weightKg: 60 + workoutIndex * 0.5,
      rir: 2,
      rpe: null,
      setType: 'normal' as const,
      supersetGroup: null,
      note: null,
      isWarmup: false,
    })),
  );
  await db.insert(sets).values(setRows);

  return { exercise, workoutRows, totalSets: setRows.length };
}

describe('performance with 1000+ sets', () => {
  it("loads a single workout's sets quickly regardless of total data volume", async () => {
    const db = createTestDb();
    const { workoutRows, totalSets } = await seedLargeDataset(db);
    expect(totalSets).toBeGreaterThan(1000);

    const targetWorkout = workoutRows[50];
    const start = Date.now();
    const result = await setsForWorkoutQuery(db, targetWorkout.id);
    const elapsedMs = Date.now() - start;

    expect(result).toHaveLength(12);
    // Großzügige Schwelle (CI-tauglich), soll nur grobe Regressionen fangen —
    // eine indexgestützte Einzel-Workout-Abfrage darf nicht Sekunden dauern.
    expect(elapsedMs).toBeLessThan(1000);
  });

  it('loads full exercise history across 1000+ sets within a reasonable time', async () => {
    const db = createTestDb();
    const { exercise, totalSets } = await seedLargeDataset(db);
    expect(totalSets).toBeGreaterThan(1000);

    const start = Date.now();
    const result = await exerciseHistoryQuery(db, exercise.id);
    const elapsedMs = Date.now() - start;

    expect(result).toHaveLength(totalSets);
    expect(elapsedMs).toBeLessThan(2000);
  });
});
