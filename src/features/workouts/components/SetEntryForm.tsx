import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { NumberStepper } from '@/components/NumberStepper';
import { COLORS, SPACING } from '@/lib/constants';
import { formatWeightKg } from '@/lib/format';

import { RirQuickChips } from './RirQuickChips';

export interface SetEntryValues {
  reps: number;
  weightKg: number;
  rir: number | undefined;
  isWarmup: boolean;
  note: string;
}

export interface SetEntryFormProps {
  values: SetEntryValues;
  onChange: (values: SetEntryValues) => void;
  onCommit: () => void;
  submitLabel?: string;
  saving?: boolean;
}

/**
 * Die "Bühne" für den nächsten Satz: Reps/Gewicht per NumberStepper, RIR als
 * Schnell-Chips, Warmup-Toggle und Notiz sind optional und blockieren den
 * < 5-Sekunden-Flow nicht — der "Satz eintragen"-Button ist immer aktiv.
 */
export function SetEntryForm({
  values,
  onChange,
  onCommit,
  submitLabel = 'Satz eintragen',
  saving,
}: SetEntryFormProps) {
  const [noteOpen, setNoteOpen] = useState(values.note.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.steppers}>
        <NumberStepper
          label="Wiederholungen"
          value={values.reps}
          step={1}
          min={0}
          onChange={(reps) => onChange({ ...values, reps })}
        />
        <NumberStepper
          label="Gewicht"
          value={values.weightKg}
          step={2.5}
          min={0}
          formatValue={formatWeightKg}
          onChange={(weightKg) => onChange({ ...values, weightKg })}
        />
      </View>

      <RirQuickChips value={values.rir} onChange={(rir) => onChange({ ...values, rir })} />

      <View style={styles.optionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange({ ...values, isWarmup: !values.isWarmup })}
          style={[styles.warmupToggle, values.isWarmup && styles.warmupToggleActive]}
        >
          <Text style={[styles.warmupLabel, values.isWarmup && styles.warmupLabelActive]}>
            Warmup
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setNoteOpen((v) => !v)} hitSlop={8}>
          <Text style={styles.noteToggle}>{noteOpen ? 'Notiz ausblenden' : '+ Notiz'}</Text>
        </Pressable>
      </View>

      {noteOpen ? (
        <TextInput
          style={styles.noteInput}
          placeholder="Notiz zu diesem Satz (optional)"
          placeholderTextColor={COLORS.textSecondary}
          value={values.note}
          onChangeText={(note) => onChange({ ...values, note })}
        />
      ) : null}

      <Button label={saving ? 'Speichern …' : submitLabel} onPress={onCommit} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  steppers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warmupToggle: {
    minHeight: 36,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmupToggleActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accent,
  },
  warmupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  warmupLabelActive: {
    color: COLORS.accent,
  },
  noteToggle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  noteInput: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
});
