import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { Snackbar } from '@/components/Snackbar';
import { TextField } from '@/components/TextField';
import type { Exercise, MuscleGroup } from '@/db/schema';
import { EquipmentContextFilterChips } from '@/features/exercises/components/EquipmentContextFilterChips';
import { ExerciseFormModal } from '@/features/exercises/components/ExerciseFormModal';
import { ExerciseListItem } from '@/features/exercises/components/ExerciseListItem';
import { MuscleGroupFilterChips } from '@/features/exercises/components/MuscleGroupFilterChips';
import { useExerciseActions, useExercises } from '@/features/exercises/hooks/useExercises';
import { COLORS, SPACING, type EquipmentContext } from '@/lib/constants';

export default function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | undefined>(undefined);
  const [equipmentContext, setEquipmentContext] = useState<EquipmentContext | undefined>(undefined);
  const [formVisible, setFormVisible] = useState(false);
  const [archivedExercise, setArchivedExercise] = useState<Exercise | undefined>(undefined);

  const { exercises, isLoading } = useExercises({ search, muscleGroup, equipmentContext });
  const { createExercise, archiveExercise, restoreExercise } = useExerciseActions();

  const hasActiveFilters =
    search.trim().length > 0 || muscleGroup !== undefined || equipmentContext !== undefined;

  const handleArchive = async (exercise: Exercise) => {
    await archiveExercise(exercise.id);
    setArchivedExercise(exercise);
  };

  const handleUndo = async () => {
    if (!archivedExercise) return;
    await restoreExercise(archivedExercise.id);
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <TextField
          placeholder="Übung suchen …"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        <MuscleGroupFilterChips value={muscleGroup} onChange={setMuscleGroup} />
        <EquipmentContextFilterChips value={equipmentContext} onChange={setEquipmentContext} />
      </View>
    ),
    [search, muscleGroup, equipmentContext],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Übungen</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFormVisible(true)}
          style={styles.addButton}
          hitSlop={8}
        >
          <Text style={styles.addButtonLabel}>+ Neu</Text>
        </Pressable>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        renderItem={({ item }) => (
          <ExerciseListItem
            exercise={item}
            onPress={() => router.push(`/exercises/${item.id}`)}
            onArchive={() => handleArchive(item)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={hasActiveFilters ? 'Keine Übungen gefunden' : 'Noch keine Übungen'}
              message={
                hasActiveFilters
                  ? 'Versuch einen anderen Suchbegriff oder Filter.'
                  : 'Lege deine erste eigene Übung an.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Übung anlegen'}
              onAction={hasActiveFilters ? undefined : () => setFormVisible(true)}
            />
          ) : null
        }
      />

      <ExerciseFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={async (input) => {
          await createExercise(input);
          setFormVisible(false);
        }}
      />

      {archivedExercise ? (
        <Snackbar
          message={`"${archivedExercise.name}" archiviert`}
          actionLabel="Rückgängig"
          onAction={handleUndo}
          onDismiss={() => setArchivedExercise(undefined)}
        />
      ) : null}
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
  addButton: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  addButtonLabel: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  listHeader: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
});
