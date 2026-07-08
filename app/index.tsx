import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { COLORS, SPACING } from '@/lib/constants';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Fitness-Progress-App</Text>

        <Card onPress={() => router.push('/templates')} style={styles.navCard}>
          <Text style={styles.navTitle}>Trainingspläne</Text>
          <Text style={styles.navSubtitle}>Pläne anlegen und Übungen zusammenstellen</Text>
        </Card>

        <Card onPress={() => router.push('/exercises')} style={styles.navCard}>
          <Text style={styles.navTitle}>Übungen</Text>
          <Text style={styles.navSubtitle}>Übungsbibliothek durchsuchen und verwalten</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  navCard: {
    gap: SPACING.xs,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  navSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
