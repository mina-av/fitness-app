import type { Exercise, TemplateExercise, Workout, WorkoutSet, WorkoutTemplate } from '@/db/schema';

/**
 * Export-Format-Version. Bei künftigen Schema-Änderungen erhöhen und einen
 * Migrationspfad im (noch nicht gebauten) Import vorsehen — die Struktur
 * hier ist bewusst 1:1 zu den DB-Tabellen, damit ein späterer Import die
 * Zeilen direkt zurückschreiben kann.
 */
export const EXPORT_FORMAT_VERSION = 1;

export interface ExportPayload {
  version: number;
  exportedAt: string;
  exercises: Exercise[];
  workoutTemplates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  workouts: Workout[];
  sets: WorkoutSet[];
}
