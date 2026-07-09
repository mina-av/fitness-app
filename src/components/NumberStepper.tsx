import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export interface NumberStepperProps {
  label?: string;
  value: number;
  step: number;
  min?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

/** Große Touch-Ziele für schnelles Satz-Logging: ±1 Rep, ±2,5 kg. Nie unter `min`. */
export function NumberStepper({
  label,
  value,
  step,
  min = 0,
  onChange,
  formatValue,
}: NumberStepperProps) {
  const decrement = () => onChange(Math.max(min, roundToStep(value - step, step)));
  const increment = () => onChange(roundToStep(value + step, step));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label ?? 'Wert'} verringern`}
          onPress={decrement}
          disabled={value <= min}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            value <= min && styles.buttonDisabled,
          ]}
          hitSlop={4}
        >
          <Text style={styles.buttonLabel}>−</Text>
        </Pressable>
        <Text style={styles.value}>{formatValue ? formatValue(value) : value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label ?? 'Wert'} erhöhen`}
          onPress={increment}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          hitSlop={4}
        >
          <Text style={styles.buttonLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function roundToStep(value: number, step: number): number {
  // Rundungsfehler bei Fließkomma-Schritten (z.B. 2,5) vermeiden.
  const rounded = Math.round(value / step) * step;
  return Math.round(rounded * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.accent,
    lineHeight: 24,
  },
  value: {
    minWidth: 64,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
