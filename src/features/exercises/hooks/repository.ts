import { and, eq, inArray, isNull, like, or } from 'drizzle-orm';

import type { AppDatabase } from '@/db/client';
import { exercises, type Exercise, type MuscleGroup } from '@/db/schema';
import { createId } from '@/lib/ids';
import { EQUIPMENT_CONTEXT_LISTS, type EquipmentContext } from '@/lib/constants';

export interface ExerciseFilters {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipmentContext?: EquipmentContext;
}

/** Query-Builder (kein await) — direkt für `useLiveQuery` oder awaited für Tests/einmalige Reads nutzbar. */
export function exercisesQuery(db: AppDatabase, filters: ExerciseFilters = {}) {
  const conditions = [isNull(exercises.deletedAt)];
  if (filters.muscleGroup) {
    conditions.push(eq(exercises.muscleGroup, filters.muscleGroup));
  }
  if (filters.equipmentContext) {
    conditions.push(
      inArray(exercises.equipment, EQUIPMENT_CONTEXT_LISTS[filters.equipmentContext]),
    );
  }
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(or(like(exercises.name, term), like(exercises.description, term))!);
  }
  return db
    .select()
    .from(exercises)
    .where(and(...conditions))
    .orderBy(exercises.name);
}

export function exerciseByIdQuery(db: AppDatabase, id: string) {
  return db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), isNull(exercises.deletedAt)));
}

export interface ExerciseInput {
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment?: string;
  description?: string;
  mediaUrl?: string;
  isCustom?: boolean;
}

export async function createExercise(db: AppDatabase, input: ExerciseInput): Promise<Exercise> {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name: input.name,
    muscleGroup: input.muscleGroup,
    secondaryMuscles: input.secondaryMuscles ? JSON.stringify(input.secondaryMuscles) : null,
    equipment: input.equipment ?? null,
    description: input.description ?? null,
    mediaUrl: input.mediaUrl ?? null,
    isCustom: input.isCustom ?? true,
  };
  await db.insert(exercises).values(row);
  return row as Exercise;
}

export type ExercisePatch = Partial<ExerciseInput>;

export async function updateExercise(
  db: AppDatabase,
  id: string,
  patch: ExercisePatch,
): Promise<void> {
  await db
    .update(exercises)
    .set({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.muscleGroup !== undefined ? { muscleGroup: patch.muscleGroup } : {}),
      ...(patch.secondaryMuscles !== undefined
        ? { secondaryMuscles: JSON.stringify(patch.secondaryMuscles) }
        : {}),
      ...(patch.equipment !== undefined ? { equipment: patch.equipment } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.mediaUrl !== undefined ? { mediaUrl: patch.mediaUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(exercises.id, id));
}

export async function archiveExercise(db: AppDatabase, id: string): Promise<void> {
  const now = new Date();
  await db.update(exercises).set({ deletedAt: now, updatedAt: now }).where(eq(exercises.id, id));
}

/** Macht ein Archivieren rückgängig (Undo-Snackbar) — löscht `deletedAt` wieder. */
export async function restoreExercise(db: AppDatabase, id: string): Promise<void> {
  await db
    .update(exercises)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(exercises.id, id));
}

export async function countExercises(db: AppDatabase): Promise<number> {
  const rows = await db.select().from(exercises);
  return rows.length;
}
