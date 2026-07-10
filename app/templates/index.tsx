import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { Snackbar } from '@/components/Snackbar';
import type { WorkoutTemplate } from '@/db/schema';
import { TemplateFormModal } from '@/features/templates/components/TemplateFormModal';
import { TemplateListItem } from '@/features/templates/components/TemplateListItem';
import { useTemplateActions, useTemplates } from '@/features/templates/hooks/useTemplates';
import { COLORS, SPACING } from '@/lib/constants';

export default function TemplatesScreen() {
  const { templates, isLoading } = useTemplates();
  const { createTemplate, archiveTemplate, restoreTemplate } = useTemplateActions();
  const [formVisible, setFormVisible] = useState(false);
  const [archivedTemplate, setArchivedTemplate] = useState<WorkoutTemplate | undefined>(undefined);

  const handleArchive = async (template: WorkoutTemplate) => {
    await archiveTemplate(template.id);
    setArchivedTemplate(template);
  };

  const handleUndo = async () => {
    if (!archivedTemplate) return;
    await restoreTemplate(archivedTemplate.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Trainingspläne</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFormVisible(true)}
          style={styles.addButton}
          hitSlop={8}
        >
          <Text style={styles.addButtonLabel}>+ Neu</Text>
        </Pressable>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        renderItem={({ item }) => (
          <TemplateListItem
            template={item}
            onPress={() => router.push(`/templates/${item.id}`)}
            onArchive={() => handleArchive(item)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="Noch keine Trainingspläne"
              message="Lege einen Plan an, z.B. Push, Pull oder Legs."
              actionLabel="Plan anlegen"
              onAction={() => setFormVisible(true)}
            />
          ) : null
        }
      />

      <TemplateFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={async (input) => {
          const template = await createTemplate(input);
          setFormVisible(false);
          router.push(`/templates/${template.id}`);
        }}
      />

      {archivedTemplate ? (
        <Snackbar
          message={`"${archivedTemplate.name}" archiviert`}
          actionLabel="Rückgängig"
          onAction={handleUndo}
          onDismiss={() => setArchivedTemplate(undefined)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerAction: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 44,
    minWidth: 44,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addButton: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  addButtonLabel: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});
