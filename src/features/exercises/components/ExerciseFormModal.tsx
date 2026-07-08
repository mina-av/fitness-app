import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { TextField } from '@/components/TextField';
import type { Exercise, MuscleGroup } from '@/db/schema';
import { COLORS, EQUIPMENT_OPTIONS, MUSCLE_GROUPS, RADIUS, SPACING } from '@/lib/constants';

import type { ExerciseInput } from '../hooks/repository';

export interface ExerciseFormModalProps {
  visible: boolean;
  initialValue?: Exercise;
  onClose: () => void;
  onSubmit: (input: ExerciseInput) => Promise<void> | void;
}

function parseSecondaryMuscles(raw: string | null): MuscleGroup[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ExerciseFormModal({
  visible,
  initialValue,
  onClose,
  onSubmit,
}: ExerciseFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Nur gemountet, während sichtbar — initialisiert den Formular-State direkt aus den
          Props statt per useEffect+setState (vermeidet kaskadierende Renders beim Öffnen). */}
      {visible ? (
        <ExerciseFormFields
          key={initialValue?.id ?? 'new'}
          initialValue={initialValue}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

interface ExerciseFormFieldsProps {
  initialValue?: Exercise;
  onClose: () => void;
  onSubmit: (input: ExerciseInput) => Promise<void> | void;
}

function ExerciseFormFields({ initialValue, onClose, onSubmit }: ExerciseFormFieldsProps) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | undefined>(
    initialValue?.muscleGroup,
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>(
    parseSecondaryMuscles(initialValue?.secondaryMuscles ?? null),
  );
  const [equipment, setEquipment] = useState<string | undefined>(
    initialValue?.equipment ?? undefined,
  );
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [mediaUrl, setMediaUrl] = useState(initialValue?.mediaUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const toggleSecondaryMuscle = (value: MuscleGroup) => {
    setSecondaryMuscles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Bitte einen Namen eingeben.');
      return;
    }
    if (!muscleGroup) {
      setError('Bitte eine Muskelgruppe auswählen.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSubmit({
        name: name.trim(),
        muscleGroup,
        secondaryMuscles: secondaryMuscles.length > 0 ? secondaryMuscles : undefined,
        equipment,
        description: description.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialValue ? 'Übung bearbeiten' : 'Neue Übung'}</Text>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="z.B. Bankdrücken"
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Muskelgruppe</Text>
          <View style={styles.chipRow}>
            {MUSCLE_GROUPS.map((group) => (
              <Chip
                key={group.value}
                label={group.label}
                active={muscleGroup === group.value}
                onPress={() => setMuscleGroup(group.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Sekundäre Muskeln (optional)</Text>
          <View style={styles.chipRow}>
            {MUSCLE_GROUPS.filter((g) => g.value !== muscleGroup).map((group) => (
              <Chip
                key={group.value}
                label={group.label}
                active={secondaryMuscles.includes(group.value)}
                onPress={() => toggleSecondaryMuscle(group.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Equipment (optional)</Text>
          <View style={styles.chipRow}>
            {EQUIPMENT_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={equipment === option.value}
                onPress={() => setEquipment(equipment === option.value ? undefined : option.value)}
              />
            ))}
          </View>
        </View>

        <TextField
          label="Beschreibung (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Kurze Ausführungshinweise"
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />

        <TextField
          label="Medien-URL (optional)"
          value={mediaUrl}
          onChangeText={setMediaUrl}
          placeholder="https://…"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label="Abbrechen"
          variant="secondary"
          onPress={onClose}
          style={styles.actionButton}
        />
        <Button
          label={saving ? 'Speichern …' : 'Speichern'}
          onPress={handleSubmit}
          disabled={saving}
          style={styles.actionButton}
        />
      </View>
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
  form: {
    gap: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  field: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  multiline: {
    minHeight: 80,
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.card,
  },
});
