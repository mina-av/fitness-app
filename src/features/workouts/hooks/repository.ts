import { and, asc, desc, eq, isNull } from 'drizzle-orm';

import type { AppDatabase } from '@/db/client';
import { sets, workouts, type SetType, type Workout, type WorkoutSet } from '@/db/schema';
import { createId } from '@/lib/ids';

// --- Workouts ----------------------------------------------------------------

export function workoutsQuery(db: AppDatabase) {
  return db.select().from(workouts).where(isNull(workouts.deletedAt)).orderBy(desc(workouts.date));
}

export function workoutByIdQuery(db: AppDatabase, id: string) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, id), isNull(workouts.deletedAt)));
}

/** Das laufende, noch nicht abgeschlossene Workout (falls die App zwischendurch beendet wurde). */
export function activeWorkoutQuery(db: AppDatabase) {
  return db
    .select()
    .from(workouts)
    .where(and(isNull(workouts.deletedAt), isNull(workouts.finishedAt)))
    .orderBy(desc(workouts.date))
    .limit(1);
}

export interface StartWorkoutInput {
  templateId?: string;
  note?: string;
  date?: Date;
}

/**
 * Startet ein Workout. Bei Start aus einem Template wird nur die `templateId`
 * referenziert — die tatsächlich geloggten Sätze (Gewicht/Reps/RIR) sind davon
 * unabhängig, spätere Template-Änderungen wirken also nie auf bereits geloggte
 * Sätze zurück.
 */
export async function startWorkout(
  db: AppDatabase,
  input: StartWorkoutInput = {},
): Promise<Workout> {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    date: input.date ?? now,
    templateId: input.templateId ?? null,
    note: input.note ?? null,
    finishedAt: null,
  };
  await db.insert(workouts).values(row);
  return row as Workout;
}

export async function finishWorkout(db: AppDatabase, id: string): Promise<void> {
  const now = new Date();
  await db.update(workouts).set({ finishedAt: now, updatedAt: now }).where(eq(workouts.id, id));
}

// --- Sets ----------------------------------------------------------------------

export function setsForWorkoutQuery(db: AppDatabase, workoutId: string) {
  return db
    .select()
    .from(sets)
    .where(and(eq(sets.workoutId, workoutId), isNull(sets.deletedAt)))
    .orderBy(asc(sets.exerciseId), asc(sets.setNumber));
}

/** Historie einer Übung über alle Workouts, chronologisch (älteste zuerst). */
export function exerciseHistoryQuery(db: AppDatabase, exerciseId: string) {
  return db
    .select({ set: sets, workout: workouts })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(and(eq(sets.exerciseId, exerciseId), isNull(sets.deletedAt), isNull(workouts.deletedAt)))
    .orderBy(asc(sets.createdAt));
}

export interface AddSetInput {
  workoutId: string;
  exerciseId: string;
  reps: number;
  weightKg: number;
  rir?: number;
  rpe?: number;
  setType?: SetType;
  supersetGroup?: string;
  note?: string;
  isWarmup?: boolean;
  /** Optional: explizite Reihenfolge, sonst automatisch fortlaufend je Übung. */
  setNumber?: number;
}

export async function addSet(db: AppDatabase, input: AddSetInput): Promise<WorkoutSet> {
  if (input.reps < 0 || input.weightKg < 0) {
    throw new Error('Reps und Gewicht dürfen nicht negativ sein.');
  }

  const setNumber = input.setNumber ?? (await nextSetNumber(db, input.workoutId, input.exerciseId));

  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    workoutId: input.workoutId,
    exerciseId: input.exerciseId,
    setNumber,
    reps: input.reps,
    weightKg: input.weightKg,
    rir: input.rir ?? null,
    rpe: input.rpe ?? null,
    setType: input.setType ?? 'normal',
    supersetGroup: input.supersetGroup ?? null,
    note: input.note ?? null,
    isWarmup: input.isWarmup ?? false,
  };
  await db.insert(sets).values(row);
  return row as WorkoutSet;
}

async function nextSetNumber(
  db: AppDatabase,
  workoutId: string,
  exerciseId: string,
): Promise<number> {
  const existing = await db
    .select()
    .from(sets)
    .where(
      and(eq(sets.workoutId, workoutId), eq(sets.exerciseId, exerciseId), isNull(sets.deletedAt)),
    );
  return existing.length + 1;
}

export type SetPatch = Partial<
  Pick<
    AddSetInput,
    'reps' | 'weightKg' | 'rir' | 'rpe' | 'setType' | 'supersetGroup' | 'note' | 'isWarmup'
  >
>;

export async function updateSet(db: AppDatabase, id: string, patch: SetPatch): Promise<void> {
  if (patch.reps !== undefined && patch.reps < 0) {
    throw new Error('Reps dürfen nicht negativ sein.');
  }
  if (patch.weightKg !== undefined && patch.weightKg < 0) {
    throw new Error('Gewicht darf nicht negativ sein.');
  }
  await db
    .update(sets)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(sets.id, id));
}

export async function removeSet(db: AppDatabase, id: string): Promise<void> {
  const now = new Date();
  await db.update(sets).set({ deletedAt: now, updatedAt: now }).where(eq(sets.id, id));
}
