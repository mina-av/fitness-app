import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import type { WorkoutSet } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';
import { formatWeightKg } from '@/lib/format';

export interface LoggedSetRowProps {
  set: WorkoutSet;
  isNewPR?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onAddDrop?: () => void;
  onAddRestPause?: () => void;
}

function setTypeLabel(setType: WorkoutSet['setType']): string | undefined {
  if (setType === 'dropset') return 'Drop-Set';
  if (setType === 'restpause') return 'Rest-Pause';
  return undefined;
}

export function LoggedSetRow({
  set,
  isNewPR,
  onEdit,
  onRemove,
  onAddDrop,
  onAddRestPause,
}: LoggedSetRowProps) {
  const typeLabel = setTypeLabel(set.setType);

  return (
    <View style={styles.container}>
      <Pressable onPress={onEdit} style={styles.main} accessibilityRole="button">
        <Text style={styles.setNumber}>{set.setNumber}</Text>
        <Text style={styles.values}>
          {set.reps} × {formatWeightKg(set.weightKg)}
        </Text>
        <View style={styles.badges}>
          {set.rir !== null ? <Badge label={`RIR ${set.rir}`} tone="neutral" /> : null}
          {set.isWarmup ? <Badge label="Warmup" tone="neutral" /> : null}
          {typeLabel ? <Badge label={typeLabel} tone="accent" /> : null}
          {isNewPR ? <Badge label="🏆 PR" tone="success" /> : null}
        </View>
      </Pressable>
      <View style={styles.actions}>
        {onAddDrop ? (
          <Pressable accessibilityRole="button" onPress={onAddDrop} hitSlop={8}>
            <Text style={styles.actionLabel}>+ Drop</Text>
          </Pressable>
        ) : null}
        {onAddRestPause ? (
          <Pressable accessibilityRole="button" onPress={onAddRestPause} hitSlop={8}>
            <Text style={styles.actionLabel}>+ Pause</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}>
          <Text style={styles.removeLabel}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  setNumber: {
    width: 20,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  values: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  removeLabel: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '700',
    padding: SPACING.xs,
  },
});
