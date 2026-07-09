import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import {
  useActiveWorkout,
  useWorkoutActions,
  useWorkouts,
  useWorkoutSets,
} from '@/features/workouts/hooks/useWorkouts';
import { COLORS, SPACING } from '@/lib/constants';

export default function NewWorkoutScreen() {
  const { activeWorkout, isLoading: activeLoading } = useActiveWorkout();
  const { templates } = useTemplates();
  const { workouts } = useWorkouts();
  const { startWorkout } = useWorkoutActions();

  const lastFinishedWorkout = useMemo(
    () => workouts.find((w) => w.finishedAt !== null),
    [workouts],
  );
  const { sets: lastWorkoutSets } = useWorkoutSets(lastFinishedWorkout?.id);

  // Es kann immer nur ein aktives Workout geben — statt Doppel-Start direkt fortsetzen.
  useEffect(() => {
    if (activeWorkout) {
      router.replace({ pathname: '/workout/[id]', params: { id: activeWorkout.id } });
    }
  }, [activeWorkout]);

  if (activeLoading || activeWorkout) {
    return <SafeAreaView style={styles.container} />;
  }

  const handleStartFromTemplate = async (templateId: string) => {
    const workout = await startWorkout({ templateId });
    router.replace({ pathname: '/workout/[id]', params: { id: workout.id } });
  };

  const handleStartFree = async () => {
    const workout = await startWorkout({});
    router.replace({ pathname: '/workout/[id]', params: { id: workout.id } });
  };

  const handleRepeatLast = async () => {
    if (!lastFinishedWorkout) return;
    const exerciseIds = Array.from(new Set(lastWorkoutSets.map((s) => s.exerciseId)));
    const workout = await startWorkout({ templateId: lastFinishedWorkout.templateId ?? undefined });
    router.replace({
      pathname: '/workout/[id]',
      params: { id: workout.id, exerciseIds: exerciseIds.join(',') },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Workout starten</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        ListHeaderComponent={
          <View style={styles.actionsSection}>
            <Pressable
              accessibilityRole="button"
              onPress={handleStartFree}
              style={styles.freeStartCard}
            >
              <Text style={styles.freeStartLabel}>Frei starten</Text>
              <Text style={styles.freeStartMeta}>Ohne Plan, Übungen frei wählen</Text>
            </Pressable>

            {lastFinishedWorkout ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleRepeatLast}
                style={styles.freeStartCard}
              >
                <Text style={styles.freeStartLabel}>Letztes Workout wiederholen</Text>
                <Text style={styles.freeStartMeta}>
                  {new Date(lastFinishedWorkout.date).toLocaleDateString('de-DE')} · gleiche Übungen
                </Text>
              </Pressable>
            ) : null}

            {templates.length > 0 ? (
              <Text style={styles.sectionTitle}>Aus Trainingsplan</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Card onPress={() => handleStartFromTemplate(item.id)}>
            <Text style={styles.templateName}>{item.name}</Text>
            {item.note ? <Text style={styles.templateNote}>{item.note}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Noch keine Trainingspläne"
            message="Du kannst trotzdem frei starten — oder erst einen Plan anlegen."
          />
        }
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
    minWidth: 44,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  actionsSection: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  freeStartCard: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 2,
  },
  freeStartLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
  },
  freeStartMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    marginTop: SPACING.md,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  templateNote: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
