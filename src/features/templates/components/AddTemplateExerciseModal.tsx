import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SearchableSelectList } from '@/components/SearchableSelectList';
import { TextField } from '@/components/TextField';
import type { Exercise } from '@/db/schema';
import { COLORS, RADIUS, SPACING } from '@/lib/constants';
import { formatMuscleGroup } from '@/lib/format';

export interface AddTemplateExerciseResult {
  exerciseId: string;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}

export interface AddTemplateExerciseModalProps {
  visible: boolean;
  exercises: Exercise[];
  onClose: () => void;
  onSubmit: (result: AddTemplateExerciseResult) => Promise<void> | void;
}

export function AddTemplateExerciseModal({
  visible,
  exercises,
  onClose,
  onSubmit,
}: AddTemplateExerciseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Nur gemountet, während sichtbar — Unmount beim Schließen setzt den State zurück. */}
      {visible ? (
        <AddTemplateExerciseFields exercises={exercises} onClose={onClose} onSubmit={onSubmit} />
      ) : null}
    </Modal>
  );
}

interface AddTemplateExerciseFieldsProps {
  exercises: Exercise[];
  onClose: () => void;
  onSubmit: (result: AddTemplateExerciseResult) => Promise<void> | void;
}

function AddTemplateExerciseFields({
  exercises,
  onClose,
  onSubmit,
}: AddTemplateExerciseFieldsProps) {
  const [selected, setSelected] = useState<Exercise | undefined>(undefined);
  const [targetSets, setTargetSets] = useState('3');
  const [targetRepsMin, setTargetRepsMin] = useState('8');
  const [targetRepsMax, setTargetRepsMax] = useState('12');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onSubmit({
        exerciseId: selected.id,
        targetSets: targetSets ? Number(targetSets) : undefined,
        targetRepsMin: targetRepsMin ? Number(targetRepsMin) : undefined,
        targetRepsMax: targetRepsMax ? Number(targetRepsMax) : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Übung hinzufügen</Text>

      {!selected ? (
        <>
          <SearchableSelectList
            items={exercises}
            keyExtractor={(item) => item.id}
            getSearchableText={(item) => item.name}
            searchPlaceholder="Übung suchen …"
            emptyMessage="Keine Übungen gefunden."
            renderItem={(item) => (
              <Card onPress={() => setSelected(item)}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>{formatMuscleGroup(item.muscleGroup)}</Text>
              </Card>
            )}
          />
          <Button label="Abbrechen" variant="secondary" onPress={onClose} />
        </>
      ) : (
        <View style={styles.form}>
          <Pressable onPress={() => setSelected(undefined)} hitSlop={8}>
            <Text style={styles.changeAction}>← Andere Übung wählen</Text>
          </Pressable>
          <Text style={styles.exerciseName}>{selected.name}</Text>

          <View style={styles.row}>
            <TextField
              label="Sätze"
              value={targetSets}
              onChangeText={setTargetSets}
              keyboardType="number-pad"
              style={styles.numberInput}
            />
            <TextField
              label="Reps min"
              value={targetRepsMin}
              onChangeText={setTargetRepsMin}
              keyboardType="number-pad"
              style={styles.numberInput}
            />
            <TextField
              label="Reps max"
              value={targetRepsMax}
              onChangeText={setTargetRepsMax}
              keyboardType="number-pad"
              style={styles.numberInput}
            />
          </View>

          <View style={styles.actions}>
            <Button
              label="Abbrechen"
              variant="secondary"
              onPress={onClose}
              style={styles.actionButton}
            />
            <Button
              label={saving ? 'Hinzufügen …' : 'Hinzufügen'}
              onPress={handleConfirm}
              disabled={saving}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}
    </View>
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
  form: {
    gap: SPACING.lg,
  },
  changeAction: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  numberInput: {
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.card,
  },
});
