import { useMemo, useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { oneRepMax, type OneRepMaxFormula } from '@/features/analysis/oneRepMax';
import type { AnalysisSet } from '@/features/analysis/types';
import { COLORS, SPACING } from '@/lib/constants';
import { formatWeightKg } from '@/lib/format';

import type { ExerciseHistoryGroup } from '../hooks/useExerciseHistory';

type Metric = 'weight' | 'e1rm' | 'volume';

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: 'weight', label: 'Gewicht' },
  { value: 'e1rm', label: 'e1RM' },
  { value: 'volume', label: 'Volumen' },
];

export interface ExerciseProgressChartsProps {
  history: ExerciseHistoryGroup[];
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export function ExerciseProgressCharts({ history }: ExerciseProgressChartsProps) {
  const [metric, setMetric] = useState<Metric>('weight');
  const [formula, setFormula] = useState<OneRepMaxFormula>('epley');

  const points = useMemo(() => {
    return history.map((group) => {
      const workingSets: AnalysisSet[] = group.sets.filter((s) => !s.isWarmup);
      let value = 0;
      if (workingSets.length > 0) {
        if (metric === 'weight') {
          value = Math.max(...workingSets.map((s) => s.weightKg));
        } else if (metric === 'e1rm') {
          value = Math.max(...workingSets.map((s) => oneRepMax(s.weightKg, s.reps, formula)));
        } else {
          value = workingSets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
        }
      }
      return {
        value: Math.round(value * 10) / 10,
        label: formatShortDate(group.workout.date),
        dataPointText: metric === 'weight' ? formatWeightKg(value) : String(Math.round(value)),
      };
    });
  }, [history, metric, formula]);

  const hasData = points.some((p) => p.value > 0);

  return (
    <View style={styles.container}>
      <View style={styles.metricRow}>
        {METRIC_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            active={metric === option.value}
            onPress={() => setMetric(option.value)}
          />
        ))}
      </View>

      {metric === 'e1rm' ? (
        <View style={styles.formulaRow}>
          <Chip label="Epley" active={formula === 'epley'} onPress={() => setFormula('epley')} />
          <Chip
            label="Brzycki"
            active={formula === 'brzycki'}
            onPress={() => setFormula('brzycki')}
          />
        </View>
      ) : null}

      {!hasData || points.length === 0 ? (
        <EmptyState
          title="Noch nicht genug Daten"
          message="Sobald du mehrere Workouts geloggt hast, erscheint hier der Verlauf."
        />
      ) : (
        <View style={styles.chartWrapper}>
          <LineChart
            data={points}
            height={180}
            color={COLORS.accent}
            thickness={2}
            dataPointsColor={COLORS.accent}
            yAxisColor={COLORS.border}
            xAxisColor={COLORS.border}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            rulesColor={COLORS.border}
            rulesType="dashed"
            curved
            noOfSections={4}
            spacing={points.length > 1 ? undefined : 40}
            initialSpacing={16}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formulaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chartWrapper: {
    paddingVertical: SPACING.sm,
  },
  axisText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});
