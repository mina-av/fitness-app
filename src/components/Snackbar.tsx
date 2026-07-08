import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export function Snackbar({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 4000,
}: SnackbarProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs, message]);

  return (
    <View style={styles.container}>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            onAction();
            onDismiss();
          }}
          hitSlop={8}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  message: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  action: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
