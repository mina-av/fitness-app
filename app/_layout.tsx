import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { db, initDb } from '@/db/client';
import { seedDatabase } from '@/features/exercises/seed/seed';
import { COLORS } from '@/lib/constants';

import migrations from '../drizzle/migrations';

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
    </View>
  );
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

/**
 * Läuft erst, sobald `db` initialisiert ist (siehe RootLayout) — damit ist
 * garantiert, dass `useMigrations(db, ...)` nie mit einer nicht zugewiesenen
 * `db` aufgerufen wird (Regeln für Hooks erlauben keinen bedingten Aufruf).
 */
function MigratedApp() {
  const { success: migrationsReady, error: migrationError } = useMigrations(db, migrations);
  const [seedError, setSeedError] = useState<Error | null>(null);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    if (!migrationsReady) {
      return;
    }
    seedDatabase(db)
      .then(() => setSeedDone(true))
      .catch((error: Error) => {
        console.error('[DIAG] seedDatabase failed:', error, error.stack);
        setSeedError(error);
      });
  }, [migrationsReady]);

  const error = migrationError ?? seedError;
  if (migrationError) {
    console.error('[DIAG] migrationError:', migrationError, migrationError.stack);
  }
  if (error) {
    return (
      <ErrorScreen title="Datenbank konnte nicht initialisiert werden" message={error.message} />
    );
  }

  if (!migrationsReady || !seedDone) {
    return <LoadingScreen text="Datenbank wird vorbereitet …" />;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .catch((error: Error) => {
        console.error('[DIAG] initDb failed:', error, error.stack);
        setDbError(error);
      });
  }, []);

  if (dbError) {
    return <ErrorScreen title="Datenbank konnte nicht geöffnet werden" message={dbError.message} />;
  }

  if (!dbReady) {
    return <LoadingScreen text="Datenbank wird geöffnet …" />;
  }

  return <MigratedApp />;
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
