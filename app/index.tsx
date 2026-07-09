import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import type { Workout } from '@/db/schema';
import { MiniWeekOverview } from '@/features/workouts/components/MiniWeekOverview';
import { WorkoutSummaryListItem } from '@/features/workouts/components/WorkoutSummaryListItem';
import {
  useActiveWorkout,
  useWorkouts,
  useWorkoutSets,
} from '@/features/workouts/hooks/useWorkouts';
import { COLORS, SPACING } from '@/lib/constants';
import { formatDateKey } from '@/lib/dates';

function RecentWorkoutItem({ workout }: { workout: Workout }) {
  const { sets } = useWorkoutSets(workout.id);
  return (
    <WorkoutSummaryListItem
      workout={workout}
      setCount={sets.length}
      onPress={() => router.push({ pathname: '/workout/[id]', params: { id: workout.id } })}
    />
  );
}

export default function DashboardScreen() {
  const { activeWorkout } = useActiveWorkout();
  const { workouts } = useWorkouts();

  const recentWorkouts = workouts.slice(0, 3);
  const trainedDateKeys = useMemo(() => {
    const keys = new Set<string>();
    workouts.forEach((w) => {
      if (w.finishedAt) keys.add(formatDateKey(new Date(w.date)));
    });
    return keys;
  }, [workouts]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Fitness-Progress-App</Text>

        <Button
          label={activeWorkout ? 'Workout fortsetzen' : 'Workout starten'}
          onPress={() =>
            activeWorkout
              ? router.push({ pathname: '/workout/[id]', params: { id: activeWorkout.id } })
              : router.push('/workout/new')
          }
        />

        <Card>
          <Text style={styles.sectionTitle}>Diese Woche</Text>
          <MiniWeekOverview trainedDateKeys={trainedDateKeys} />
        </Card>

        <Card onPress={() => router.push('/templates')} style={styles.navCard}>
          <Text style={styles.navTitle}>Trainingspläne</Text>
          <Text style={styles.navSubtitle}>Pläne anlegen und Übungen zusammenstellen</Text>
        </Card>

        <Card onPress={() => router.push('/exercises')} style={styles.navCard}>
          <Text style={styles.navTitle}>Übungen</Text>
          <Text style={styles.navSubtitle}>Übungsbibliothek durchsuchen und verwalten</Text>
        </Card>

        <Card onPress={() => router.push('/analysis')} style={styles.navCard}>
          <Text style={styles.navTitle}>Wochenanalyse</Text>
          <Text style={styles.navSubtitle}>Volumen, PRs, Empfehlungen und Trainings-Heatmap</Text>
        </Card>

        <Text style={styles.sectionTitle}>Letzte Workouts</Text>
        {recentWorkouts.length === 0 ? (
          <EmptyState title="Noch keine Workouts" message="Starte dein erstes Workout oben." />
        ) : (
          <View style={styles.recentList}>
            {recentWorkouts.map((workout) => (
              <RecentWorkoutItem key={workout.id} workout={workout} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
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
  recentList: {
    gap: SPACING.sm,
  },
});
