import { and, asc, eq, isNull } from 'drizzle-orm';

import type { AppDatabase } from '@/db/client';
import {
  exercises,
  templateExercises,
  workoutTemplates,
  type TemplateExercise,
  type WorkoutTemplate,
} from '@/db/schema';
import { createId } from '@/lib/ids';

export function templatesQuery(db: AppDatabase) {
  return db
    .select()
    .from(workoutTemplates)
    .where(isNull(workoutTemplates.deletedAt))
    .orderBy(asc(workoutTemplates.position));
}

export function templateByIdQuery(db: AppDatabase, id: string) {
  return db.select().from(workoutTemplates).where(eq(workoutTemplates.id, id));
}

/** Übungen eines Plans inkl. Übungsdetails, sortiert nach Position. */
export function templateExercisesQuery(db: AppDatabase, templateId: string) {
  return db
    .select({ templateExercise: templateExercises, exercise: exercises })
    .from(templateExercises)
    .innerJoin(exercises, eq(templateExercises.exerciseId, exercises.id))
    .where(and(eq(templateExercises.templateId, templateId), isNull(templateExercises.deletedAt)))
    .orderBy(asc(templateExercises.position));
}

export interface TemplateInput {
  name: string;
  note?: string;
  position?: number;
}

export async function createTemplate(
  db: AppDatabase,
  input: TemplateInput,
): Promise<WorkoutTemplate> {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name: input.name,
    note: input.note ?? null,
    position: input.position ?? 0,
  };
  await db.insert(workoutTemplates).values(row);
  return row as WorkoutTemplate;
}

export async function updateTemplate(
  db: AppDatabase,
  id: string,
  patch: Partial<TemplateInput>,
): Promise<void> {
  await db
    .update(workoutTemplates)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(workoutTemplates.id, id));
}

export async function archiveTemplate(db: AppDatabase, id: string): Promise<void> {
  const now = new Date();
  await db
    .update(workoutTemplates)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(workoutTemplates.id, id));
}

export interface TemplateExerciseInput {
  templateId: string;
  exerciseId: string;
  position: number;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}

export async function addTemplateExercise(
  db: AppDatabase,
  input: TemplateExerciseInput,
): Promise<TemplateExercise> {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    templateId: input.templateId,
    exerciseId: input.exerciseId,
    position: input.position,
    targetSets: input.targetSets ?? null,
    targetRepsMin: input.targetRepsMin ?? null,
    targetRepsMax: input.targetRepsMax ?? null,
  };
  await db.insert(templateExercises).values(row);
  return row as TemplateExercise;
}

export async function removeTemplateExercise(db: AppDatabase, id: string): Promise<void> {
  const now = new Date();
  await db
    .update(templateExercises)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(templateExercises.id, id));
}

/** Setzt die Reihenfolge der Übungen eines Plans neu (Drag & Drop). */
export async function reorderTemplateExercises(
  db: AppDatabase,
  orderedIds: string[],
): Promise<void> {
  const now = new Date();
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(templateExercises)
      .set({ position: i, updatedAt: now })
      .where(eq(templateExercises.id, orderedIds[i]));
  }
}
