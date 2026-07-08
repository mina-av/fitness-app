import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={COLORS.textSecondary}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  input: {
    minHeight: 44,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
});
