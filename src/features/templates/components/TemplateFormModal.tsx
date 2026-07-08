import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import type { WorkoutTemplate } from '@/db/schema';
import { COLORS, RADIUS, SPACING } from '@/lib/constants';

import type { TemplateInput } from '../hooks/repository';

export interface TemplateFormModalProps {
  visible: boolean;
  initialValue?: WorkoutTemplate;
  onClose: () => void;
  onSubmit: (input: TemplateInput) => Promise<void> | void;
}

export function TemplateFormModal({
  visible,
  initialValue,
  onClose,
  onSubmit,
}: TemplateFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? (
        <TemplateFormFields
          key={initialValue?.id ?? 'new'}
          initialValue={initialValue}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Modal>
  );
}

interface TemplateFormFieldsProps {
  initialValue?: WorkoutTemplate;
  onClose: () => void;
  onSubmit: (input: TemplateInput) => Promise<void> | void;
}

function TemplateFormFields({ initialValue, onClose, onSubmit }: TemplateFormFieldsProps) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [note, setNote] = useState(initialValue?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Bitte einen Namen eingeben.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onSubmit({ name: name.trim(), note: note.trim() || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialValue ? 'Plan bearbeiten' : 'Neuer Trainingsplan'}</Text>

      <TextField label="Name" value={name} onChangeText={setName} placeholder="z.B. Push" />
      <TextField
        label="Notiz (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="z.B. Brust, Schultern, Trizeps"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button
          label="Abbrechen"
          variant="secondary"
          onPress={onClose}
          style={styles.actionButton}
        />
        <Button
          label={saving ? 'Speichern …' : 'Speichern'}
          onPress={handleSubmit}
          disabled={saving}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 'auto',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.card,
  },
});
