import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { db } from '@/db/client';
import { seedDatabase } from '@/features/exercises/seed/seed';
import { COLORS } from '@/lib/constants';

import migrations from '../drizzle/migrations';

export default function RootLayout() {
  const { success: migrationsReady, error: migrationError } = useMigrations(db, migrations);
  const [seedError, setSeedError] = useState<Error | null>(null);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    if (!migrationsReady) {
      return;
    }
    seedDatabase(db)
      .then(() => setSeedDone(true))
      .catch((error: Error) => setSeedError(error));
  }, [migrationsReady]);

  const error = migrationError ?? seedError;
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Datenbank konnte nicht initialisiert werden</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!migrationsReady || !seedDone) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Datenbank wird vorbereitet …</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
  },
});
