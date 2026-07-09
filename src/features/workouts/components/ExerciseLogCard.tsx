import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import type { Exercise, SetType, WorkoutSet } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';

import { LoggedSetRow } from './LoggedSetRow';
import { SetEntryForm, type SetEntryValues } from './SetEntryForm';

export interface ExerciseTarget {
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
}

export interface ExerciseLogCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  lastTimeSummary?: string;
  target?: ExerciseTarget;
  supersetPartnerNames?: string[];
  isNewPR: (set: WorkoutSet) => boolean;
  onAddSet: (values: SetEntryValues, setType: SetType) => Promise<void>;
  onUpdateSet: (id: string, values: SetEntryValues) => Promise<void>;
  onRemoveSet: (id: string) => Promise<void>;
  onLinkSuperset?: () => void;
}

function formatTarget(target?: ExerciseTarget): string | undefined {
  if (!target) return undefined;
  const parts: string[] = [];
  if (target.targetSets !== null) parts.push(`${target.targetSets} ×`);
  if (target.targetRepsMin !== null && target.targetRepsMax !== null) {
    parts.push(
      target.targetRepsMin === target.targetRepsMax
        ? `${target.targetRepsMin}`
        : `${target.targetRepsMin}–${target.targetRepsMax}`,
    );
  }
  return parts.length > 0 ? `Ziel: ${parts.join(' ')}` : undefined;
}

function defaultEntryValues(sets: WorkoutSet[]): SetEntryValues {
  const last = sets[sets.length - 1];
  return {
    reps: last?.reps ?? 8,
    weightKg: last?.weightKg ?? 0,
    rir: last?.rir ?? undefined,
    isWarmup: false,
    note: '',
  };
}

export function ExerciseLogCard({
  exercise,
  sets,
  lastTimeSummary,
  target,
  supersetPartnerNames,
  isNewPR,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onLinkSuperset,
}: ExerciseLogCardProps) {
  const [entryValues, setEntryValues] = useState<SetEntryValues>(() => defaultEntryValues(sets));
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const targetLabel = formatTarget(target);

  const handleCommit = async () => {
    setSaving(true);
    try {
      if (editingSetId) {
        await onUpdateSet(editingSetId, entryValues);
        setEditingSetId(null);
      } else {
        await onAddSet(entryValues, 'normal');
      }
      setEntryValues((prev) => ({ ...prev, note: '', isWarmup: false }));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    setEntryValues({
      reps: set.reps,
      weightKg: set.weightKg,
      rir: set.rir ?? undefined,
      isWarmup: set.isWarmup,
      note: set.note ?? '',
    });
  };

  const handleAddDrop = async (afterSet: WorkoutSet) => {
    await onAddSet(
      {
        reps: afterSet.reps,
        weightKg: Math.max(0, Math.round((afterSet.weightKg * 0.8) / 2.5) * 2.5),
        rir: undefined,
        isWarmup: false,
        note: '',
      },
      'dropset',
    );
  };

  const handleAddRestPause = async (afterSet: WorkoutSet) => {
    await onAddSet(
      {
        reps: Math.max(1, Math.round(afterSet.reps / 2)),
        weightKg: afterSet.weightKg,
        rir: undefined,
        isWarmup: false,
        note: '',
      },
      'restpause',
    );
  };

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{exercise.name}</Text>
          {lastTimeSummary ? <Text style={styles.meta}>Letztes Mal: {lastTimeSummary}</Text> : null}
          {targetLabel ? <Text style={styles.meta}>{targetLabel}</Text> : null}
        </View>
        {onLinkSuperset ? (
          <Pressable accessibilityRole="button" onPress={onLinkSuperset} hitSlop={8}>
            <Text style={styles.supersetAction}>Superset</Text>
          </Pressable>
        ) : null}
      </View>

      {supersetPartnerNames && supersetPartnerNames.length > 0 ? (
        <View style={styles.supersetBanner}>
          <Badge label={`Superset mit ${supersetPartnerNames.join(', ')}`} tone="accent" />
          <Text style={styles.supersetHint}>Wechsle zwischen den Übungen ab.</Text>
        </View>
      ) : null}

      {sets.length > 0 ? (
        <View style={styles.setList}>
          {sets.map((set) => (
            <LoggedSetRow
              key={set.id}
              set={set}
              isNewPR={isNewPR(set)}
              onEdit={() => handleEdit(set)}
              onRemove={() => onRemoveSet(set.id)}
              onAddDrop={set.setType !== 'restpause' ? () => handleAddDrop(set) : undefined}
              onAddRestPause={set.setType !== 'dropset' ? () => handleAddRestPause(set) : undefined}
            />
          ))}
        </View>
      ) : null}

      {editingSetId ? (
        <Pressable
          onPress={() => {
            setEditingSetId(null);
            setEntryValues(defaultEntryValues(sets));
          }}
          hitSlop={8}
        >
          <Text style={styles.cancelEdit}>Bearbeitung abbrechen</Text>
        </Pressable>
      ) : null}

      <SetEntryForm
        values={entryValues}
        onChange={setEntryValues}
        onCommit={handleCommit}
        submitLabel={editingSetId ? 'Satz aktualisieren' : 'Satz eintragen'}
        saving={saving}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  supersetAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    minHeight: 44,
    textAlignVertical: 'center',
  },
  supersetBanner: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  supersetHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  setList: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  cancelEdit: {
    marginTop: SPACING.sm,
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '600',
  },
});
