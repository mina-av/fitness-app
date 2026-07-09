import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { MonthHeatmap } from '@/features/analysis/components/MonthHeatmap';
import { MuscleGroupVolumeList } from '@/features/analysis/components/MuscleGroupVolumeList';
import { RecommendationsList } from '@/features/analysis/components/RecommendationsList';
import { VolumeTrendChart } from '@/features/analysis/components/VolumeTrendChart';
import { WeekNavigator } from '@/features/analysis/components/WeekNavigator';
import { WeeklyStatsCard } from '@/features/analysis/components/WeeklyStatsCard';
import { useHeatmapData } from '@/features/analysis/hooks/useHeatmapData';
import { useWeeklyAnalysis } from '@/features/analysis/hooks/useWeeklyAnalysis';
import { useWorkouts } from '@/features/workouts/hooks/useWorkouts';
import { COLORS, SPACING } from '@/lib/constants';
import { formatDateKey } from '@/lib/dates';

export default function WeeklyAnalysisScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = useMemo(() => new Date(), []);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  const report = useWeeklyAnalysis(weekOffset);
  const { heatmap } = useHeatmapData();
  const { workouts } = useWorkouts();

  const workoutIdByDateKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const workout of workouts) {
      const key = formatDateKey(new Date(workout.date));
      if (!map.has(key) || workout.finishedAt) {
        map.set(key, workout.id);
      }
    }
    return map;
  }, [workouts]);

  const handleSelectDay = (dateKey: string) => {
    const workoutId = workoutIdByDateKey.get(dateKey);
    if (workoutId) {
      router.push({ pathname: '/workout/[id]', params: { id: workoutId } });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerAction}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Wochenanalyse</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <WeekNavigator weekOffset={weekOffset} onChange={setWeekOffset} />

        <WeeklyStatsCard
          workoutsCount={report.workoutsCount}
          totalVolume={report.totalVolume}
          volumeChangePercent={report.comparisonToPreviousWeek.volumeChangePercent}
          newPRsCount={report.newPRs.length}
        />

        <Text style={styles.sectionTitle}>Volumen pro Muskelgruppe</Text>
        <MuscleGroupVolumeList volumeByMuscleGroup={report.volumeByMuscleGroup} />

        <Card>
          <VolumeTrendChart data={report.last8WeeksVolume} currentWeekOffset={weekOffset} />
        </Card>

        <Text style={styles.sectionTitle}>Empfehlungen</Text>
        <RecommendationsList recommendations={report.recommendations} />

        <Text style={styles.sectionTitle}>Trainingshäufigkeit</Text>
        <Card>
          <MonthHeatmap
            year={calendarYear}
            month={calendarMonth}
            heatmap={heatmap}
            onSelectDay={handleSelectDay}
            onChangeMonth={(year, month) => {
              setCalendarYear(year);
              setCalendarMonth(month);
            }}
          />
        </Card>
      </ScrollView>
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
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
  },
});
