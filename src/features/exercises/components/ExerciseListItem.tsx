import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import type { Exercise } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';
import { formatEquipment, formatMuscleGroup } from '@/lib/format';

export interface ExerciseListItemProps {
  exercise: Exercise;
  onPress: () => void;
  onArchive?: () => void;
}

export function ExerciseListItem({ exercise, onPress, onArchive }: ExerciseListItemProps) {
  const equipmentLabel = formatEquipment(exercise.equipment);
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        {!exercise.isCustom ? <Badge label="Standard" tone="accent" /> : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta}>
          {formatMuscleGroup(exercise.muscleGroup)}
          {equipmentLabel ? ` · ${equipmentLabel}` : ''}
        </Text>
        {onArchive ? (
          <Pressable accessibilityRole="button" onPress={onArchive} hitSlop={8}>
            <Text style={styles.archiveAction}>Archivieren</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  footer: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  archiveAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
