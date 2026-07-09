import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import type { Workout } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';

export interface WorkoutSummaryListItemProps {
  workout: Workout;
  setCount: number;
  onPress: () => void;
}

export function WorkoutSummaryListItem({
  workout,
  setCount,
  onPress,
}: WorkoutSummaryListItemProps) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.date}>
          {new Date(workout.date).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })}
        </Text>
        {!workout.finishedAt ? <Badge label="Läuft" tone="accent" /> : null}
      </View>
      <Text style={styles.meta}>{setCount} Sätze</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  meta: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
