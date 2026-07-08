import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import type { MuscleGroup } from '@/db/schema';
import { ExerciseFormModal } from '@/features/exercises/components/ExerciseFormModal';
import { MediaPreview } from '@/features/exercises/components/MediaPreview';
import { useExercise, useExerciseActions } from '@/features/exercises/hooks/useExercises';
import { useExerciseHistory } from '@/features/exercises/hooks/useExerciseHistory';
import { COLORS, SPACING } from '@/lib/constants';
import { formatEquipment, formatMuscleGroup } from '@/lib/format';

function parseSecondaryMuscles(raw: string | null): MuscleGroup[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, isLoading } = useExercise(id);
  const { history } = useExerciseHistory(id);
  const { updateExercise, archiveExercise } = useExerciseActions();
  const [editVisible, setEditVisible] = useState(false);

  if (!isLoading && !exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="Übung nicht gefunden" message="Sie wurde möglicherweise archiviert." />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return <SafeAreaView style={styles.container} />;
  }

  const secondaryMuscles = parseSecondaryMuscles(exercise.secondaryMuscles);
  const equipmentLabel = formatEquipment(exercise.equipment);

  const handleArchive = async () => {
    await archiveExercise(exercise.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setEditVisible(true)} hitSlop={8}>
          <Text style={styles.headerAction}>Bearbeiten</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <MediaPreview mediaUrl={exercise.mediaUrl} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>{exercise.name}</Text>
          {!exercise.isCustom ? <Badge label="Standard" tone="accent" /> : null}
        </View>

        <View style={styles.badgeRow}>
          <Badge label={formatMuscleGroup(exercise.muscleGroup)} tone="accent" />
          {secondaryMuscles.map((muscle) => (
            <Badge key={muscle} label={formatMuscleGroup(muscle)} tone="neutral" />
          ))}
          {equipmentLabel ? <Badge label={equipmentLabel} tone="neutral" /> : null}
        </View>

        {exercise.description ? (
          <Text style={styles.description}>{exercise.description}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>Verlauf</Text>
        {history.length === 0 ? (
          <EmptyState
            title="Noch keine Sätze geloggt"
            message="Sobald du diese Übung trainierst, erscheint hier der Verlauf."
          />
        ) : (
          <View style={styles.historyList}>
            {[...history].reverse().map((group) => (
              <Card key={group.workout.id}>
                <Text style={styles.historyDate}>
                  {new Date(group.workout.date).toLocaleDateString('de-DE')}
                </Text>
                {group.sets.map((set) => (
                  <Text key={set.id} style={styles.historySet}>
                    {set.reps} × {set.weightKg} kg{set.rir !== null ? ` · RIR ${set.rir}` : ''}
                    {set.isWarmup ? ' · Warmup' : ''}
                  </Text>
                ))}
              </Card>
            ))}
          </View>
        )}

        <Pressable accessibilityRole="button" onPress={handleArchive} style={styles.archiveButton}>
          <Text style={styles.archiveLabel}>Übung archivieren</Text>
        </Pressable>
      </ScrollView>

      <ExerciseFormModal
        visible={editVisible}
        initialValue={exercise}
        onClose={() => setEditVisible(false)}
        onSubmit={async (input) => {
          await updateExercise(exercise.id, input);
          setEditVisible(false);
        }}
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
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  historyList: {
    gap: SPACING.sm,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  historySet: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  archiveButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  archiveLabel: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
