import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/Chip';
import { EQUIPMENT_CONTEXTS, type EquipmentContext } from '@/lib/constants';

export interface EquipmentContextFilterChipsProps {
  value: EquipmentContext | undefined;
  onChange: (value: EquipmentContext | undefined) => void;
}

/** "Zuhause" vs. "Gym" — aus dem Equipment einer Übung hergeleitet, siehe src/lib/constants.ts. */
export function EquipmentContextFilterChips({ value, onChange }: EquipmentContextFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Chip label="Alle" active={value === undefined} onPress={() => onChange(undefined)} />
      {EQUIPMENT_CONTEXTS.map((context) => (
        <Chip
          key={context.value}
          label={context.label}
          active={value === context.value}
          onPress={() => onChange(value === context.value ? undefined : context.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingVertical: 4,
  },
});
