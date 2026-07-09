import { isNull } from 'drizzle-orm';

import type { AppDatabase } from '@/db/client';
import { exercises, sets, templateExercises, workouts, workoutTemplates } from '@/db/schema';

import { EXPORT_FORMAT_VERSION, type ExportPayload } from '../types';

/**
 * Sammelt alle nicht-gelöschten Entitäten für den Daten-Export. 1:1-Abbild
 * der DB-Tabellen (kein Umformen), damit ein späterer Import die Zeilen
 * direkt zurückschreiben kann.
 */
export async function gatherExportPayload(db: AppDatabase): Promise<ExportPayload> {
  const [exerciseRows, templateRows, templateExerciseRows, workoutRows, setRows] =
    await Promise.all([
      db.select().from(exercises).where(isNull(exercises.deletedAt)),
      db.select().from(workoutTemplates).where(isNull(workoutTemplates.deletedAt)),
      db.select().from(templateExercises).where(isNull(templateExercises.deletedAt)),
      db.select().from(workouts).where(isNull(workouts.deletedAt)),
      db.select().from(sets).where(isNull(sets.deletedAt)),
    ]);

  return {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    exercises: exerciseRows,
    workoutTemplates: templateRows,
    templateExercises: templateExerciseRows,
    workouts: workoutRows,
    sets: setRows,
  };
}
