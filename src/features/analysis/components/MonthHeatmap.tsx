import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING } from '@/lib/constants';
import { getMonthCalendarDays } from '@/lib/dates';

import type { HeatmapEntry } from '../consistency';

export interface MonthHeatmapProps {
  year: number;
  month: number;
  heatmap: HeatmapEntry[];
  onSelectDay?: (dateKey: string) => void;
  onChangeMonth: (year: number, month: number) => void;
}

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTH_LABELS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

function intensityColor(volume: number, maxVolume: number): string {
  if (volume <= 0) return COLORS.surfaceElevated;
  const ratio = maxVolume > 0 ? volume / maxVolume : 0;
  if (ratio > 0.66) return COLORS.accent;
  if (ratio > 0.33) return COLORS.accentMuted;
  return COLORS.border;
}

export function MonthHeatmap({
  year,
  month,
  heatmap,
  onSelectDay,
  onChangeMonth,
}: MonthHeatmapProps) {
  const volumeByDate = useMemo(() => {
    const map = new Map<string, number>();
    heatmap.forEach((entry) => map.set(entry.dateKey, entry.volume));
    return map;
  }, [heatmap]);

  const maxVolume = useMemo(() => Math.max(0, ...heatmap.map((e) => e.volume)), [heatmap]);
  const days = useMemo(() => getMonthCalendarDays(year, month), [year, month]);

  const handlePrevMonth = () => {
    if (month === 0) onChangeMonth(year - 1, 11);
    else onChangeMonth(year, month - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) onChangeMonth(year + 1, 0);
    else onChangeMonth(year, month + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={handlePrevMonth}
          hitSlop={8}
          style={styles.navButton}
        >
          <Text style={styles.navLabel}>←</Text>
        </Pressable>
        <Text style={styles.title}>
          {MONTH_LABELS[month]} {year}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleNextMonth}
          hitSlop={8}
          style={styles.navButton}
        >
          <Text style={styles.navLabel}>→</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const volume = volumeByDate.get(day.dateKey) ?? 0;
          return (
            <Pressable
              key={day.dateKey}
              accessibilityRole="button"
              disabled={volume <= 0 || !onSelectDay}
              onPress={() => onSelectDay?.(day.dateKey)}
              style={[
                styles.dayCell,
                { backgroundColor: intensityColor(volume, maxVolume) },
                !day.isCurrentMonth && styles.dayCellOutside,
              ]}
            >
              <Text style={[styles.dayLabel, !day.isCurrentMonth && styles.dayLabelOutside]}>
                {day.date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginVertical: 1,
  },
  dayCellOutside: {
    opacity: 0.35,
  },
  dayLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  dayLabelOutside: {
    color: COLORS.textSecondary,
  },
});
