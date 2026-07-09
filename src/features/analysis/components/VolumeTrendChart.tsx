import { BarChart } from 'react-native-gifted-charts';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING } from '@/lib/constants';

import type { WeekVolumePoint } from '../types';

export interface VolumeTrendChartProps {
  data: WeekVolumePoint[];
  currentWeekOffset: number;
}

export function VolumeTrendChart({ data, currentWeekOffset }: VolumeTrendChartProps) {
  const bars = data.map((point) => ({
    value: Math.round(point.volume),
    label: point.weekOffset === 0 ? 'jetzt' : String(point.weekOffset),
    frontColor: point.weekOffset === currentWeekOffset ? COLORS.accent : COLORS.surfaceElevated,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volumen — letzte 8 Wochen</Text>
      <BarChart
        data={bars}
        height={140}
        barWidth={20}
        spacing={16}
        noOfSections={4}
        yAxisColor={COLORS.border}
        xAxisColor={COLORS.border}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        rulesColor={COLORS.border}
        rulesType="dashed"
        frontColor={COLORS.surfaceElevated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  axisText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});
