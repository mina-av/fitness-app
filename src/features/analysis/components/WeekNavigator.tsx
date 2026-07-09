import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING } from '@/lib/constants';
import { getWeekRange } from '@/lib/dates';

export interface WeekNavigatorProps {
  weekOffset: number;
  onChange: (weekOffset: number) => void;
  /** Kann nicht in die Zukunft navigieren. */
  maxOffset?: number;
}

function formatWeekLabel(weekOffset: number): string {
  const { start, end } = getWeekRange(weekOffset);
  const format = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  if (weekOffset === 0) return `Diese Woche (${format(start)}–${format(end)})`;
  if (weekOffset === -1) return `Letzte Woche (${format(start)}–${format(end)})`;
  return `${format(start)}–${format(end)}`;
}

export function WeekNavigator({ weekOffset, onChange, maxOffset = 0 }: WeekNavigatorProps) {
  const canGoForward = weekOffset < maxOffset;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vorherige Woche"
        onPress={() => onChange(weekOffset - 1)}
        hitSlop={8}
        style={styles.arrowButton}
      >
        <Text style={styles.arrow}>←</Text>
      </Pressable>

      <Text style={styles.label}>{formatWeekLabel(weekOffset)}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nächste Woche"
        onPress={() => canGoForward && onChange(weekOffset + 1)}
        disabled={!canGoForward}
        hitSlop={8}
        style={styles.arrowButton}
      >
        <Text style={[styles.arrow, !canGoForward && styles.arrowDisabled]}>→</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  arrowButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent,
  },
  arrowDisabled: {
    color: COLORS.border,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
