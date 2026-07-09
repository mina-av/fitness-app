import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import type { Exercise, SetType } from '@/db/schema';
import { useExercises } from '@/features/exercises/hooks/useExercises';
import { useTemplateExercises } from '@/features/templates/hooks/useTemplates';
import { AddWorkoutExerciseModal } from '@/features/workouts/components/AddWorkoutExerciseModal';
import { ExerciseLogCardContainer } from '@/features/workouts/components/ExerciseLogCardContainer';
import { SupersetLinkModal } from '@/features/workouts/components/SupersetLinkModal';
import {
  useWorkout,
  useWorkoutActions,
  useWorkoutSets,
} from '@/features/workouts/hooks/useWorkouts';
import type { SetEntryValues } from '@/features/workouts/components/SetEntryForm';
import { createId } from '@/lib/ids';
import { COLORS, SPACING } from '@/lib/constants';

export default function ActiveWorkoutScreen() {
  const { id, exerciseIds: exerciseIdsParam } = useLocalSearchParams<{
    id: string;
    exerciseIds?: string;
  }>();

  const { workout, isLoading: workoutLoading } = useWorkout(id);
  const { sets } = useWorkoutSets(id);
  const { exercises: allExercises } = useExercises();
  const { templateExercises } = useTemplateExercises(workout?.templateId ?? undefined);
  const { finishWorkout, addSet, updateSet, removeSet } = useWorkoutActions();

  const [addedExerciseIds, setAddedExerciseIds] = useState<string[]>([]);
  const [supersetGroups, setSupersetGroups] = useState<Record<string, string>>({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [linkingExerciseId, setLinkingExerciseId] = useState<string | undefined>(undefined);
  const [finishing, setFinishing] = useState(false);

  const exerciseById = useMemo(() => {
    const map = new Map<string, Exercise>();
    allExercises.forEach((e) => map.set(e.id, e));
    return map;
  }, [allExercises]);

  const targetByExerciseId = useMemo(() => {
    const map = new Map<string, (typeof templateExercises)[number]['templateExercise']>();
    templateExercises.forEach((row) => map.set(row.exercise.id, row.templateExercise));
    return map;
  }, [templateExercises]);

  const initialParamIds = useMemo(
    () => (exerciseIdsParam ? exerciseIdsParam.split(',').filter(Boolean) : []),
    [exerciseIdsParam],
  );

  const loggedExerciseIds = useMemo(
    () => Array.from(new Set(sets.map((s) => s.exerciseId))),
    [sets],
  );

  const orderedExerciseIds = useMemo(() => {
    const ids: string[] = [];
    const add = (candidateId: string) => {
      if (!ids.includes(candidateId)) ids.push(candidateId);
    };
    templateExercises.forEach((row) => add(row.exercise.id));
    initialParamIds.forEach(add);
    addedExerciseIds.forEach(add);
    loggedExerciseIds.forEach(add);
    return ids;
  }, [templateExercises, initialParamIds, addedExerciseIds, loggedExerciseIds]);

  if (workoutLoading) {
    return <SafeAreaView style={styles.container} />;
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="Workout nicht gefunden" />
      </SafeAreaView>
    );
  }

  const handleAddSet = async (exerciseId: string, values: SetEntryValues, setType: SetType) => {
    await addSet({
      workoutId: workout.id,
      exerciseId,
      reps: values.reps,
      weightKg: values.weightKg,
      rir: values.rir,
      isWarmup: values.isWarmup,
      note: values.note.trim() || undefined,
      setType,
      supersetGroup: supersetGroups[exerciseId],
    });
  };

  const handleUpdateSet = async (setId: string, values: SetEntryValues) => {
    await updateSet(setId, {
      reps: values.reps,
      weightKg: values.weightKg,
      rir: values.rir,
      isWarmup: values.isWarmup,
      note: values.note.trim() || undefined,
    });
  };

  const handleLinkSuperset = (targetExercise: Exercise) => {
    if (!linkingExerciseId) return;
    setSupersetGroups((prev) => {
      const groupId = prev[linkingExerciseId] ?? prev[targetExercise.id] ?? createId();
      return { ...prev, [linkingExerciseId]: groupId, [targetExercise.id]: groupId };
    });
    setLinkingExerciseId(undefined);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await finishWorkout(workout.id);
      router.replace('/');
    } finally {
      setFinishing(false);
    }
  };

  const pickableExercises = allExercises.filter((e) => !orderedExerciseIds.includes(e.id));
  const supersetCandidates = linkingExerciseId
    ? orderedExerciseIds
        .filter((eid) => eid !== linkingExerciseId)
        .map((eid) => exerciseById.get(eid))
        .filter((e): e is Exercise => !!e)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>
          {new Date(workout.date).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleFinish}
          disabled={finishing}
          hitSlop={8}
        >
          <Text style={styles.finishAction}>{finishing ? '…' : 'Fertig'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {orderedExerciseIds.length === 0 ? (
          <EmptyState
            title="Noch keine Übungen"
            message="Füge eine Übung hinzu, um loszulegen."
            actionLabel="Übung hinzufügen"
            onAction={() => setAddModalVisible(true)}
          />
        ) : (
          orderedExerciseIds.map((exerciseId) => {
            const exercise = exerciseById.get(exerciseId);
            if (!exercise) return null;
            const currentSets = sets.filter((s) => s.exerciseId === exerciseId);
            const groupId = supersetGroups[exerciseId];
            const partnerNames = groupId
              ? orderedExerciseIds
                  .filter((eid) => eid !== exerciseId && supersetGroups[eid] === groupId)
                  .map((eid) => exerciseById.get(eid)?.name)
                  .filter((n): n is string => !!n)
              : [];
            const target = targetByExerciseId.get(exerciseId);

            return (
              <ExerciseLogCardContainer
                key={exerciseId}
                exercise={exercise}
                workoutId={workout.id}
                currentSets={currentSets}
                target={
                  target
                    ? {
                        targetSets: target.targetSets,
                        targetRepsMin: target.targetRepsMin,
                        targetRepsMax: target.targetRepsMax,
                      }
                    : undefined
                }
                supersetPartnerNames={partnerNames}
                onAddSet={handleAddSet}
                onUpdateSet={handleUpdateSet}
                onRemoveSet={removeSet}
                onLinkSuperset={() => setLinkingExerciseId(exerciseId)}
              />
            );
          })
        )}

        <Button
          label="+ Übung hinzufügen"
          variant="secondary"
          onPress={() => setAddModalVisible(true)}
        />
      </ScrollView>

      <AddWorkoutExerciseModal
        visible={addModalVisible}
        exercises={pickableExercises}
        onClose={() => setAddModalVisible(false)}
        onSelect={(exercise) => setAddedExerciseIds((prev) => [...prev, exercise.id])}
      />

      <SupersetLinkModal
        visible={linkingExerciseId !== undefined}
        candidates={supersetCandidates}
        onClose={() => setLinkingExerciseId(undefined)}
        onSelect={handleLinkSuperset}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerAction: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  finishAction: {
    color: COLORS.success,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
});
