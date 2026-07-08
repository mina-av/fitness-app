import { exercises, type MuscleGroup } from '@/db/schema';
import { createId } from '@/lib/ids';
import { createTestDb } from '@/test-utils/createTestDb';

import {
  addTemplateExercise,
  archiveTemplate,
  createTemplate,
  removeTemplateExercise,
  reorderTemplateExercises,
  templateExercisesQuery,
  templatesQuery,
  updateTemplate,
} from './repository';

/** Fügt eine Test-Übung direkt ein (kein Feature-übergreifender Import der Exercises-Repository). */
async function insertTestExercise(
  db: ReturnType<typeof createTestDb>,
  name: string,
  muscleGroup: MuscleGroup,
) {
  const now = new Date();
  const row = {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    name,
    muscleGroup,
    isCustom: true,
  };
  await db.insert(exercises).values(row);
  return row;
}

describe('templates repository', () => {
  it('creates a template and lists it ordered by position', async () => {
    const db = createTestDb();
    await createTemplate(db, { name: 'Pull', position: 1 });
    await createTemplate(db, { name: 'Push', position: 0 });

    const list = await templatesQuery(db);
    expect(list.map((t) => t.name)).toEqual(['Push', 'Pull']);
  });

  it('adds exercises to a template and returns them ordered with exercise details', async () => {
    const db = createTestDb();
    const template = await createTemplate(db, { name: 'Push' });
    const bench = await insertTestExercise(db, 'Bankdrücken', 'brust');
    const shoulder = await insertTestExercise(db, 'Schulterdrücken', 'schultern');

    await addTemplateExercise(db, {
      templateId: template.id,
      exerciseId: shoulder.id,
      position: 1,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
    });
    await addTemplateExercise(db, {
      templateId: template.id,
      exerciseId: bench.id,
      position: 0,
      targetSets: 4,
      targetRepsMin: 6,
      targetRepsMax: 10,
    });

    const rows = await templateExercisesQuery(db, template.id);
    expect(rows.map((r) => r.exercise.name)).toEqual(['Bankdrücken', 'Schulterdrücken']);
    expect(rows[0].templateExercise.targetSets).toBe(4);
  });

  it('reorders template exercises', async () => {
    const db = createTestDb();
    const template = await createTemplate(db, { name: 'Push' });
    const a = await insertTestExercise(db, 'A', 'brust');
    const b = await insertTestExercise(db, 'B', 'brust');

    const first = await addTemplateExercise(db, {
      templateId: template.id,
      exerciseId: a.id,
      position: 0,
    });
    const second = await addTemplateExercise(db, {
      templateId: template.id,
      exerciseId: b.id,
      position: 1,
    });

    await reorderTemplateExercises(db, [second.id, first.id]);

    const rows = await templateExercisesQuery(db, template.id);
    expect(rows.map((r) => r.exercise.name)).toEqual(['B', 'A']);
  });

  it('soft-deletes a template exercise and a template', async () => {
    const db = createTestDb();
    const template = await createTemplate(db, { name: 'Push' });
    const exercise = await insertTestExercise(db, 'Bankdrücken', 'brust');
    const templateExercise = await addTemplateExercise(db, {
      templateId: template.id,
      exerciseId: exercise.id,
      position: 0,
    });

    await removeTemplateExercise(db, templateExercise.id);
    expect(await templateExercisesQuery(db, template.id)).toHaveLength(0);

    await archiveTemplate(db, template.id);
    expect(await templatesQuery(db)).toHaveLength(0);
  });

  it('updates a template and refreshes updatedAt', async () => {
    const db = createTestDb();
    const template = await createTemplate(db, { name: 'Push' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await updateTemplate(db, template.id, { note: 'Fokus Brust' });

    const [updated] = await templatesQuery(db);
    expect(updated.note).toBe('Fokus Brust');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(template.updatedAt.getTime());
  });
});
