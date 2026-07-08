import { createTestDb } from '@/test-utils/createTestDb';

import {
  archiveExercise,
  createExercise,
  exerciseByIdQuery,
  exercisesQuery,
  updateExercise,
} from './repository';

describe('exercises repository', () => {
  it('creates an exercise and finds it by id', async () => {
    const db = createTestDb();
    const created = await createExercise(db, { name: 'Bankdrücken', muscleGroup: 'brust' });

    const found = await exerciseByIdQuery(db, created.id);
    expect(found).toHaveLength(1);
    expect(found[0].name).toBe('Bankdrücken');
    expect(found[0].muscleGroup).toBe('brust');
    expect(found[0].isCustom).toBe(true);
  });

  it('lists only non-deleted exercises, sorted by name', async () => {
    const db = createTestDb();
    await createExercise(db, { name: 'Kniebeuge', muscleGroup: 'beine' });
    await createExercise(db, { name: 'Ausfallschritt', muscleGroup: 'beine' });

    const list = await exercisesQuery(db);
    expect(list.map((e) => e.name)).toEqual(['Ausfallschritt', 'Kniebeuge']);
  });

  it('filters by muscle group and search term', async () => {
    const db = createTestDb();
    await createExercise(db, { name: 'Bankdrücken', muscleGroup: 'brust' });
    await createExercise(db, { name: 'Kniebeuge', muscleGroup: 'beine' });

    const chestOnly = await exercisesQuery(db, { muscleGroup: 'brust' });
    expect(chestOnly).toHaveLength(1);
    expect(chestOnly[0].name).toBe('Bankdrücken');

    const searchResult = await exercisesQuery(db, { search: 'knie' });
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].name).toBe('Kniebeuge');
  });

  it('updates a field and refreshes updatedAt', async () => {
    const db = createTestDb();
    const created = await createExercise(db, { name: 'Rudern', muscleGroup: 'ruecken' });

    await new Promise((resolve) => setTimeout(resolve, 5));
    await updateExercise(db, created.id, { description: 'Langhantel vorgebeugt' });

    const [updated] = await exerciseByIdQuery(db, created.id);
    expect(updated.description).toBe('Langhantel vorgebeugt');
    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('soft-deletes an exercise: row stays in DB but is filtered out of reads', async () => {
    const db = createTestDb();
    const created = await createExercise(db, { name: 'Schulterdrücken', muscleGroup: 'schultern' });

    await archiveExercise(db, created.id);

    const found = await exerciseByIdQuery(db, created.id);
    expect(found).toHaveLength(0);

    const list = await exercisesQuery(db);
    expect(list).toHaveLength(0);
  });
});
