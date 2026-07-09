import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import type { Exercise } from '@/db/schema';
import { COLORS, SPACING } from '@/lib/constants';

export interface SupersetLinkModalProps {
  visible: boolean;
  candidates: Exercise[];
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function SupersetLinkModal({
  visible,
  candidates,
  onClose,
  onSelect,
}: SupersetLinkModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? (
        <View style={styles.container}>
          <Text style={styles.title}>Mit welcher Übung verbinden?</Text>
          <FlatList
            data={candidates}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
            renderItem={({ item }) => (
              <Card
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.exerciseName}>{item.name}</Text>
              </Card>
            )}
            ListEmptyComponent={
              <EmptyState
                title="Keine weitere Übung"
                message="Füge zuerst eine zweite Übung zum Workout hinzu."
              />
            }
          />
          <Button label="Abbrechen" variant="secondary" onPress={onClose} />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingVertical: SPACING.sm,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
