import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SearchableSelectList } from '@/components/SearchableSelectList';
import type { Exercise } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';
import { formatMuscleGroup } from '@/lib/format';

export interface AddWorkoutExerciseModalProps {
  visible: boolean;
  exercises: Exercise[];
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function AddWorkoutExerciseModal({
  visible,
  exercises,
  onClose,
  onSelect,
}: AddWorkoutExerciseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? (
        <View style={styles.container}>
          <Text style={styles.title}>Übung hinzufügen</Text>
          <SearchableSelectList
            items={exercises}
            keyExtractor={(item) => item.id}
            getSearchableText={(item) => item.name}
            searchPlaceholder="Übung suchen …"
            emptyMessage="Keine Übungen gefunden."
            renderItem={(item) => (
              <Card
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>{formatMuscleGroup(item.muscleGroup)}</Text>
              </Card>
            )}
          />
          <Button label="Abbrechen" variant="secondary" onPress={onClose} />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  exerciseMeta: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
