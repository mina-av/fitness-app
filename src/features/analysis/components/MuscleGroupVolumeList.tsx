import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { COLORS, SPACING } from '@/lib/constants';
import { formatMuscleGroup } from '@/lib/format';

import type { MuscleGroup } from '../types';

export interface MuscleGroupVolumeListProps {
  volumeByMuscleGroup: { muscleGroup: MuscleGroup; volume: number }[];
}

export function MuscleGroupVolumeList({ volumeByMuscleGroup }: MuscleGroupVolumeListProps) {
  if (volumeByMuscleGroup.length === 0) {
    return (
      <EmptyState
        title="Kein Volumen diese Woche"
        message="Noch keine Sätze in dieser Woche geloggt."
      />
    );
  }

  const maxVolume = Math.max(...volumeByMuscleGroup.map((g) => g.volume));
  const sorted = [...volumeByMuscleGroup].sort((a, b) => b.volume - a.volume);

  return (
    <Card>
      <View style={styles.list}>
        {sorted.map((group) => (
          <View key={group.muscleGroup} style={styles.row}>
            <Text style={styles.label}>{formatMuscleGroup(group.muscleGroup)}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${maxVolume > 0 ? (group.volume / maxVolume) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.value}>{Math.round(group.volume)} kg</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    width: 80,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  value: {
    width: 64,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
