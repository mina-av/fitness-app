import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { AddTemplateExerciseModal } from '@/features/templates/components/AddTemplateExerciseModal';
import { TemplateExerciseRow } from '@/features/templates/components/TemplateExerciseRow';
import { TemplateFormModal } from '@/features/templates/components/TemplateFormModal';
import {
  useTemplate,
  useTemplateActions,
  useTemplateExercises,
} from '@/features/templates/hooks/useTemplates';
import { useExercises } from '@/features/exercises/hooks/useExercises';
import { COLORS, SPACING } from '@/lib/constants';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { template, isLoading } = useTemplate(id);
  const { templateExercises } = useTemplateExercises(id);
  const { exercises } = useExercises();
  const {
    updateTemplate,
    archiveTemplate,
    addTemplateExercise,
    removeTemplateExercise,
    reorderTemplateExercises,
  } = useTemplateActions();

  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  if (!isLoading && !template) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="Plan nicht gefunden" message="Er wurde möglicherweise archiviert." />
      </SafeAreaView>
    );
  }

  if (!template) {
    return <SafeAreaView style={styles.container} />;
  }

  const alreadyAddedIds = new Set(templateExercises.map((row) => row.exercise.id));
  const pickableExercises = exercises.filter((e) => !alreadyAddedIds.has(e.id));

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= templateExercises.length) return;
    const orderedIds = templateExercises.map((row) => row.templateExercise.id);
    [orderedIds[index], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[index]];
    await reorderTemplateExercises(orderedIds);
  };

  const handleArchive = async () => {
    await archiveTemplate(template.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setEditVisible(true)} hitSlop={8}>
          <Text style={styles.headerAction}>Bearbeiten</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{template.name}</Text>
        {template.note ? <Text style={styles.note}>{template.note}</Text> : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Übungen</Text>
          <Pressable accessibilityRole="button" onPress={() => setAddVisible(true)} hitSlop={8}>
            <Text style={styles.headerAction}>+ Hinzufügen</Text>
          </Pressable>
        </View>

        {templateExercises.length === 0 ? (
          <EmptyState
            title="Noch keine Übungen"
            message="Füge Übungen mit Ziel-Sätzen und Rep-Bereich hinzu."
            actionLabel="Übung hinzufügen"
            onAction={() => setAddVisible(true)}
          />
        ) : (
          <View style={styles.exerciseList}>
            {templateExercises.map((row, index) => (
              <TemplateExerciseRow
                key={row.templateExercise.id}
                row={row}
                onMoveUp={index > 0 ? () => handleMove(index, -1) : undefined}
                onMoveDown={
                  index < templateExercises.length - 1 ? () => handleMove(index, 1) : undefined
                }
                onRemove={() => removeTemplateExercise(row.templateExercise.id)}
              />
            ))}
          </View>
        )}

        <Pressable accessibilityRole="button" onPress={handleArchive} style={styles.archiveButton}>
          <Text style={styles.archiveLabel}>Plan archivieren</Text>
        </Pressable>
      </ScrollView>

      <TemplateFormModal
        visible={editVisible}
        initialValue={template}
        onClose={() => setEditVisible(false)}
        onSubmit={async (input) => {
          await updateTemplate(template.id, input);
          setEditVisible(false);
        }}
      />

      <AddTemplateExerciseModal
        visible={addVisible}
        exercises={pickableExercises}
        onClose={() => setAddVisible(false)}
        onSubmit={async (result) => {
          await addTemplateExercise({
            templateId: template.id,
            exerciseId: result.exerciseId,
            position: templateExercises.length,
            targetSets: result.targetSets,
            targetRepsMin: result.targetRepsMin,
            targetRepsMax: result.targetRepsMax,
          });
          setAddVisible(false);
        }}
      />
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
    textAlignVertical: 'center',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  note: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  exerciseList: {
    gap: SPACING.sm,
  },
  archiveButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  archiveLabel: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
