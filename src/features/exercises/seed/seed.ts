import type { AppDatabase } from '@/db/client';
import { exercises, templateExercises, workoutTemplates } from '@/db/schema';
import { createId } from '@/lib/ids';

import { exerciseSeedData } from './exercises.seed';
import { templateSeedData } from './templates.seed';

/**
 * Befüllt die Standard-Übungsbibliothek und legt (einmalig) 2 Beispiel-
 * Trainingspläne an.
 *
 * Übungen werden inkrementell nach Namen abgeglichen (auch gegen bereits
 * archivierte/soft-deleted Zeilen) — läuft bei jedem App-Start und ergänzt
 * neu hinzugekommene Standardübungen auch bei Nutzer:innen, die die App
 * schon länger installiert haben, ohne bestehende Einträge zu duplizieren.
 *
 * Templates laufen weiterhin nur "einmalig bei leerer Tabelle": anders als
 * bei Übungen wäre ein nachträgliches Hinzufügen der Beispiel-Pläne in eine
 * bereits von Nutzer:innen angepasste Planliste unerwartet/aufdringlich.
 */
export async function seedDatabase(db: AppDatabase): Promise<void> {
  const exerciseIdByName = await seedExercises(db);
  await seedTemplatesIfEmpty(db, exerciseIdByName);
}

async function seedExercises(db: AppDatabase): Promise<Map<string, string>> {
  // Inkl. soft-deleted: eine von Nutzer:innen bewusst archivierte Standard-
  // übung soll beim nächsten App-Start nicht als "Duplikat" wieder auftauchen.
  const existingRows = await db.select().from(exercises);
  const idByName = new Map(existingRows.map((row) => [row.name, row.id]));

  const now = new Date();
  for (const data of exerciseSeedData) {
    if (idByName.has(data.name)) continue;

    const id = createId();
    idByName.set(data.name, id);
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

  return idByName;
}

async function seedTemplatesIfEmpty(
  db: AppDatabase,
  exerciseIdByName: Map<string, string>,
): Promise<void> {
  const existingTemplates = await db.select().from(workoutTemplates).limit(1);
  if (existingTemplates.length > 0) return;

  const now = new Date();
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
