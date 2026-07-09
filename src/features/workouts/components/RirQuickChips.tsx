import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { COLORS, SPACING } from '@/lib/constants';

const RIR_OPTIONS = [0, 1, 2, 3, 4] as const;

export interface RirQuickChipsProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

/** RIR ist optional und darf den Logging-Flow nicht blockieren — erneutes Tippen hebt die Auswahl auf. */
export function RirQuickChips({ value, onChange }: RirQuickChipsProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>RIR</Text>
      {RIR_OPTIONS.map((option) => (
        <Chip
          key={option}
          label={option === 4 ? '4+' : String(option)}
          active={value === option}
          onPress={() => onChange(value === option ? undefined : option)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginRight: SPACING.xs,
  },
});
