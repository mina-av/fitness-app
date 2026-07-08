import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

import { db } from '@/db/client';
import type { Exercise, TemplateExercise, WorkoutTemplate } from '@/db/schema';

import {
  addTemplateExercise as addTemplateExerciseRepo,
  archiveTemplate as archiveTemplateRepo,
  createTemplate as createTemplateRepo,
  removeTemplateExercise as removeTemplateExerciseRepo,
  reorderTemplateExercises as reorderTemplateExercisesRepo,
  restoreTemplate as restoreTemplateRepo,
  templateByIdQuery,
  templateExercisesQuery,
  templatesQuery,
  updateTemplate as updateTemplateRepo,
  type TemplateExerciseInput,
  type TemplateInput,
} from './repository';

export function useTemplates() {
  const { data, updatedAt, error } = useLiveQuery(templatesQuery(db));
  return {
    templates: (data ?? []) as WorkoutTemplate[],
    isLoading: updatedAt === undefined,
    error,
  };
}

export function useTemplate(id: string | undefined) {
  const { data, updatedAt, error } = useLiveQuery(templateByIdQuery(db, id ?? '__none__'), [id]);
  return {
    template: (data?.[0] as WorkoutTemplate | undefined) ?? undefined,
    isLoading: updatedAt === undefined,
    error,
  };
}

export interface TemplateExerciseRow {
  templateExercise: TemplateExercise;
  exercise: Exercise;
}

export function useTemplateExercises(templateId: string | undefined) {
  const { data, updatedAt, error } = useLiveQuery(
    templateExercisesQuery(db, templateId ?? '__none__'),
    [templateId],
  );
  return {
    templateExercises: (data ?? []) as TemplateExerciseRow[],
    isLoading: updatedAt === undefined,
    error,
  };
}

export function useTemplateActions() {
  const createTemplate = useCallback((input: TemplateInput) => createTemplateRepo(db, input), []);
  const updateTemplate = useCallback(
    (id: string, patch: Partial<TemplateInput>) => updateTemplateRepo(db, id, patch),
    [],
  );
  const archiveTemplate = useCallback((id: string) => archiveTemplateRepo(db, id), []);
  const restoreTemplate = useCallback((id: string) => restoreTemplateRepo(db, id), []);
  const addTemplateExercise = useCallback(
    (input: TemplateExerciseInput) => addTemplateExerciseRepo(db, input),
    [],
  );
  const removeTemplateExercise = useCallback(
    (id: string) => removeTemplateExerciseRepo(db, id),
    [],
  );
  const reorderTemplateExercises = useCallback(
    (orderedIds: string[]) => reorderTemplateExercisesRepo(db, orderedIds),
    [],
  );

  return {
    createTemplate,
    updateTemplate,
    archiveTemplate,
    restoreTemplate,
    addTemplateExercise,
    removeTemplateExercise,
    reorderTemplateExercises,
  };
}
