import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { COLORS, SPACING } from '@/lib/constants';
import { formatWeightKg } from '@/lib/format';

export interface WeeklyStatsCardProps {
  workoutsCount: number;
  totalVolume: number;
  volumeChangePercent: number | null;
  newPRsCount: number;
}

export function WeeklyStatsCard({
  workoutsCount,
  totalVolume,
  volumeChangePercent,
  newPRsCount,
}: WeeklyStatsCardProps) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.value}>{workoutsCount}</Text>
          <Text style={styles.label}>Einheiten</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{formatWeightKg(totalVolume)}</Text>
          <Text style={styles.label}>Volumen</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.value}>{newPRsCount}</Text>
          <Text style={styles.label}>Neue PRs</Text>
        </View>
      </View>

      <Text style={styles.comparison}>
        {volumeChangePercent === null
          ? 'Noch keine Vorwoche zum Vergleichen — das legt sich mit der Zeit.'
          : volumeChangePercent >= 0
            ? `+${Math.round(volumeChangePercent)} % Volumen ggü. letzter Woche`
            : `${Math.round(volumeChangePercent)} % Volumen ggü. letzter Woche`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  comparison: {
    marginTop: SPACING.md,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
