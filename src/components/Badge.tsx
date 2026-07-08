import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export type BadgeTone = 'accent' | 'neutral' | 'success';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      <Text style={[styles.label, toneTextStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

const toneStyles = StyleSheet.create({
  accent: { backgroundColor: COLORS.accentMuted },
  neutral: { backgroundColor: COLORS.surfaceElevated },
  success: { backgroundColor: '#123321' },
});

const toneTextStyles = StyleSheet.create({
  accent: { color: COLORS.accent },
  neutral: { color: COLORS.textSecondary },
  success: { color: COLORS.success },
});
