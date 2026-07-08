import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accent,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.accent,
  },
});
