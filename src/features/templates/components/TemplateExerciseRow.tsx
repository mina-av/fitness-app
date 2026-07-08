import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { COLORS, SPACING } from '@/lib/constants';

import type { TemplateExerciseRow as TemplateExerciseRowData } from '../hooks/useTemplates';

export interface TemplateExerciseRowProps {
  row: TemplateExerciseRowData;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
}

function formatTarget(sets: number | null, repsMin: number | null, repsMax: number | null): string {
  const parts: string[] = [];
  if (sets !== null) parts.push(`${sets} ×`);
  if (repsMin !== null && repsMax !== null) {
    parts.push(repsMin === repsMax ? `${repsMin}` : `${repsMin}–${repsMax}`);
  } else if (repsMin !== null) {
    parts.push(`ab ${repsMin}`);
  }
  return parts.length > 0 ? parts.join(' ') : 'Kein Zielwert';
}

export function TemplateExerciseRow({
  row,
  onMoveUp,
  onMoveDown,
  onRemove,
}: TemplateExerciseRowProps) {
  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {row.exercise.name}
          </Text>
          <Text style={styles.target}>
            {formatTarget(
              row.templateExercise.targetSets,
              row.templateExercise.targetRepsMin,
              row.templateExercise.targetRepsMax,
            )}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            disabled={!onMoveUp}
            onPress={onMoveUp}
            hitSlop={8}
            style={styles.actionButton}
          >
            <Text style={[styles.actionLabel, !onMoveUp && styles.actionLabelDisabled]}>↑</Text>
          </Pressable>
          <Pressable
            disabled={!onMoveDown}
            onPress={onMoveDown}
            hitSlop={8}
            style={styles.actionButton}
          >
            <Text style={[styles.actionLabel, !onMoveDown && styles.actionLabelDisabled]}>↓</Text>
          </Pressable>
          <Pressable onPress={onRemove} hitSlop={8} style={styles.actionButton}>
            <Text style={styles.removeLabel}>Entfernen</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  target: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  actionLabelDisabled: {
    color: COLORS.border,
  },
  removeLabel: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
