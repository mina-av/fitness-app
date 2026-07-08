import type { AppDatabase } from '@/db/client';
import { exercises, templateExercises, workoutTemplates } from '@/db/schema';
import { createId } from '@/lib/ids';

import { exerciseSeedData } from './exercises.seed';
import { templateSeedData } from './templates.seed';

/**
 * Befüllt eine leere DB mit der Standard-Übungsbibliothek + 2 Beispiel-Templates.
 * Läuft nur, wenn noch keine Übungen existieren (idempotent über App-Starts hinweg).
 * Legt `workout_templates`/`template_exercises` direkt an (kein Import aus dem
 * templates-Feature — Invariante: kein Feature importiert aus einem anderen Feature).
 */
export async function seedDatabase(db: AppDatabase): Promise<void> {
  const existing = await db.select().from(exercises).limit(1);
  if (existing.length > 0) {
    return;
  }

  const exerciseIdByName = new Map<string, string>();
  const now = new Date();

  for (const data of exerciseSeedData) {
    const id = createId();
    exerciseIdByName.set(data.name, id);
    await db.insert(exercises).values({
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      name: data.name,
      muscleGroup: data.muscleGroup,
      secondaryMuscles: data.secondaryMuscles ? JSON.stringify(data.secondaryMuscles) : null,
      equipment: data.equipment,
      description: data.description,
      mediaUrl: null,
      isCustom: false,
    });
  }

  for (const [templateIndex, template] of templateSeedData.entries()) {
    const templateId = createId();
    await db.insert(workoutTemplates).values({
      id: templateId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      name: template.name,
      note: template.note ?? null,
      position: templateIndex,
    });

    for (const [position, templateExercise] of template.exercises.entries()) {
      const exerciseId = exerciseIdByName.get(templateExercise.exerciseName);
      if (!exerciseId) {
        throw new Error(
          `Seed-Template "${template.name}" referenziert unbekannte Übung "${templateExercise.exerciseName}".`,
        );
      }
      await db.insert(templateExercises).values({
        id: createId(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        templateId,
        exerciseId,
        position,
        targetSets: templateExercise.targetSets,
        targetRepsMin: templateExercise.targetRepsMin,
        targetRepsMax: templateExercise.targetRepsMax,
      });
    }
  }
}
