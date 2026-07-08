import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import type { WorkoutTemplate } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';

export interface TemplateListItemProps {
  template: WorkoutTemplate;
  onPress: () => void;
  onArchive?: () => void;
}

export function TemplateListItem({ template, onPress, onArchive }: TemplateListItemProps) {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {template.name}
        </Text>
      </View>
      {template.note ? (
        <Text style={styles.note} numberOfLines={1}>
          {template.note}
        </Text>
      ) : null}
      {onArchive ? (
        <Pressable
          accessibilityRole="button"
          onPress={onArchive}
          hitSlop={8}
          style={styles.archive}
        >
          <Text style={styles.archiveAction}>Archivieren</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  note: {
    marginTop: SPACING.xs,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  archive: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  archiveAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
