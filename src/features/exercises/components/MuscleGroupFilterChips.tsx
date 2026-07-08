import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/Chip';
import { MUSCLE_GROUPS } from '@/lib/constants';
import type { MuscleGroup } from '@/db/schema';

export interface MuscleGroupFilterChipsProps {
  value: MuscleGroup | undefined;
  onChange: (value: MuscleGroup | undefined) => void;
}

export function MuscleGroupFilterChips({ value, onChange }: MuscleGroupFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Chip label="Alle" active={value === undefined} onPress={() => onChange(undefined)} />
      {MUSCLE_GROUPS.map((group) => (
        <Chip
          key={group.value}
          label={group.label}
          active={value === group.value}
          onPress={() => onChange(value === group.value ? undefined : group.value)}
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
