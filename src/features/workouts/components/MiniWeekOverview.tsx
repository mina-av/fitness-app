import { StyleSheet, Text, View } from 'react-native';

import { formatDateKey, isSameDay, startOfWeek } from '@/lib/dates';
import { COLORS, SPACING } from '@/lib/constants';

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export interface MiniWeekOverviewProps {
  trainedDateKeys: Set<string>;
}

/** Sieben Punkte Mo–So: gefüllt, wenn an dem Tag ein Workout abgeschlossen wurde. */
export function MiniWeekOverview({ trainedDateKeys }: MiniWeekOverviewProps) {
  const today = new Date();
  const weekStart = startOfWeek(today);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <View style={styles.row}>
      {days.map((date, index) => {
        const trained = trainedDateKeys.has(formatDateKey(date));
        const isToday = isSameDay(date, today);
        return (
          <View key={index} style={styles.dayColumn}>
            <Text style={styles.label}>{WEEKDAY_LABELS[index]}</Text>
            <View style={[styles.dot, trained && styles.dotFilled, isToday && styles.dotToday]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dotFilled: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dotToday: {
    borderColor: COLORS.textPrimary,
  },
});
