import { eq } from 'drizzle-orm';

import { exercises, workoutTemplates } from '@/db/schema';
import { createId } from '@/lib/ids';
import { createTestDb } from '@/test-utils/createTestDb';

import {
  activeWorkoutQuery,
  addSet,
  exerciseHistoryQuery,
  finishWorkout,
  removeSet,
  setsForWorkoutQuery,
  startWorkout,
  updateSet,
  workoutsQuery,
} from './repository';

async function insertTestExercise(db: ReturnType<typeof createTestDb>, name = 'Bankdrücken') {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name,
    muscleGroup: 'brust' as const,
    isCustom: true,
  };
  await db.insert(exercises).values(row);
  return row;
}

async function insertTestTemplate(db: ReturnType<typeof createTestDb>, name = 'Push') {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name,
    note: null,
    position: 0,
  };
  await db.insert(workoutTemplates).values(row);
  return row;
}

describe('workouts repository', () => {
  it('starts a free workout without a template', async () => {
    const db = createTestDb();
    const workout = await startWorkout(db, {});
    expect(workout.templateId).toBeNull();
    expect(workout.finishedAt).toBeNull();

    const list = await workoutsQuery(db);
    expect(list).toHaveLength(1);
  });

  it('starts a workout from a template by reference only (no copy table)', async () => {
    const db = createTestDb();
    const template = await insertTestTemplate(db);
    const workout = await startWorkout(db, { templateId: template.id });
    expect(workout.templateId).toBe(template.id);
  });

  it('an unfinished workout is resumable via useActiveWorkout / activeWorkoutQuery (app-kill survives)', async () => {
    const db = createTestDb();
    const workout = await startWorkout(db, {});

    const active = await activeWorkoutQuery(db);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe(workout.id);

    await finishWorkout(db, workout.id);
    const activeAfterFinish = await activeWorkoutQuery(db);
    expect(activeAfterFinish).toHaveLength(0);
  });

  it('template changes never retroactively affect already-logged sets', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const template = await insertTestTemplate(db);
    const workout = await startWorkout(db, { templateId: template.id });

    const loggedSet = await addSet(db, {
      workoutId: workout.id,
      exerciseId: exercise.id,
      reps: 8,
      weightKg: 80,
      rir: 2,
    });

    // "Ändern" des Templates (z.B. umbenennen) darf den bereits geloggten Satz nicht beeinflussen,
    // weil sets keine Zielwerte aus dem Template referenzieren, sondern nur das tatsächlich Geleistete.
    await db
      .update(workoutTemplates)
      .set({ name: 'Renamed' })
      .where(eq(workoutTemplates.id, template.id));

    const [unchanged] = await setsForWorkoutQuery(db, workout.id);
    expect(unchanged.id).toBe(loggedSet.id);
    expect(unchanged.reps).toBe(8);
    expect(unchanged.weightKg).toBe(80);
  });
});

describe('sets repository', () => {
  it('adds sets with auto-incrementing setNumber per exercise', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const workout = await startWorkout(db, {});

    const first = await addSet(db, {
      workoutId: workout.id,
      exerciseId: exercise.id,
      reps: 10,
      weightKg: 60,
    });
    const second = await addSet(db, {
      workoutId: workout.id,
      exerciseId: exercise.id,
      reps: 8,
      weightKg: 65,
    });

    expect(first.setNumber).toBe(1);
    expect(second.setNumber).toBe(2);
  });

  it('rejects negative reps or weight', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const workout = await startWorkout(db, {});

    await expect(
      addSet(db, { workoutId: workout.id, exerciseId: exercise.id, reps: -1, weightKg: 60 }),
    ).rejects.toThrow();
    await expect(
      addSet(db, { workoutId: workout.id, exerciseId: exercise.id, reps: 10, weightKg: -5 }),
    ).rejects.toThrow();
  });

  it('excludes warmup sets from nothing structurally, but flags them for downstream analysis', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const workout = await startWorkout(db, {});

    const warmup = await addSet(db, {
      workoutId: workout.id,
      exerciseId: exercise.id,
      reps: 15,
      weightKg: 20,
      isWarmup: true,
    });
    expect(warmup.isWarmup).toBe(true);
  });

  it('updates a set and refreshes updatedAt', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const workout = await startWorkout(db, {});
    const created = await addSet(db, {
      workoutId: workout.id,
      exerciseId: exercise.id,
      reps: 10,
      weightKg: 60,
    });

    await new Promise((resolve) => setTimeout(resolve, 5));
    await updateSet(db, created.id, { reps: 12, note: 'Letzter Satz leicht' });

    const [updated] = await setsForWorkoutQuery(db, workout.id);
    expect(updated.reps).toBe(12);
    expect(updated.note).toBe('Letzter Satz leicht');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('soft-deletes a set: filtered from reads but not hard-deleted', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const workout = await startWorkout(db, {});
    const created = await addSet(db, {
      workoutId: workout.id,
      exerciseId: exercise.id,
      reps: 10,
      weightKg: 60,
    });

    await removeSet(db, created.id);

    expect(await setsForWorkoutQuery(db, workout.id)).toHaveLength(0);
  });

  it('groups exercise history chronologically by workout', async () => {
    const db = createTestDb();
    const exercise = await insertTestExercise(db);
    const workoutA = await startWorkout(db, {});
    await addSet(db, { workoutId: workoutA.id, exerciseId: exercise.id, reps: 10, weightKg: 60 });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const workoutB = await startWorkout(db, {});
    await addSet(db, { workoutId: workoutB.id, exerciseId: exercise.id, reps: 8, weightKg: 65 });

    const rows = await exerciseHistoryQuery(db, exercise.id);
    expect(rows).toHaveLength(2);
    expect(rows[0].workout.id).toBe(workoutA.id);
    expect(rows[1].workout.id).toBe(workoutB.id);
  });
});
