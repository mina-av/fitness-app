import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useDataExport } from '@/features/export/hooks/useDataExport';
import { COLORS, SPACING } from '@/lib/constants';

export default function SettingsScreen() {
  const { exportData, isExporting, error } = useDataExport();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Einstellungen</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Daten-Backup</Text>
          <Text style={styles.cardSubtitle}>
            Exportiert alle Übungen, Trainingspläne, Workouts und Sätze als JSON-Datei — solange es
            keine Cloud-Synchronisation gibt, ist das dein einziges Backup.
          </Text>
          <Button
            label={isExporting ? 'Exportiere …' : 'Daten exportieren'}
            onPress={exportData}
            disabled={isExporting}
            style={styles.exportButton}
          />
          {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
        </Card>
      </View>
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
  content: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  exportButton: {
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
});
