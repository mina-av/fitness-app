import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'ghost' ? styles.labelGhost : styles.labelSolid]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelSolid: {
    color: COLORS.textPrimary,
  },
  labelGhost: {
    color: COLORS.accent,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
});
