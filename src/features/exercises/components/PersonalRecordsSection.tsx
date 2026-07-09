import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { epley1RM } from '@/features/analysis/oneRepMax';
import { calculatePersonalRecords } from '@/features/analysis/personalRecords';
import type { AnalysisSet } from '@/features/analysis/types';
import { COLORS, SPACING } from '@/lib/constants';
import { formatWeightKg } from '@/lib/format';

import type { ExerciseHistoryGroup } from '../hooks/useExerciseHistory';

export interface PersonalRecordsSectionProps {
  history: ExerciseHistoryGroup[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function PersonalRecordsSection({ history }: PersonalRecordsSectionProps) {
  const allSets = useMemo<AnalysisSet[]>(() => history.flatMap((group) => group.sets), [history]);
  const records = useMemo(() => calculatePersonalRecords(allSets), [allSets]);

  const topRepRecords = useMemo(
    () =>
      Array.from(records.mostRepsAtWeight.entries())
        .sort((a, b) => b[0] - a[0])
        .slice(0, 3),
    [records.mostRepsAtWeight],
  );

  if (!records.heaviestSet && !records.bestE1RM) {
    return (
      <EmptyState
        title="Noch keine Rekorde"
        message="Sobald du einen Arbeitssatz loggst, erscheinen hier deine PRs."
      />
    );
  }

  return (
    <View style={styles.grid}>
      {records.heaviestSet ? (
        <Card style={styles.card}>
          <Text style={styles.label}>Schwerster Satz</Text>
          <Text style={styles.value}>
            {formatWeightKg(records.heaviestSet.weightKg)} × {records.heaviestSet.reps}
          </Text>
          <Text style={styles.date}>{formatDate(records.heaviestSet.createdAt)}</Text>
        </Card>
      ) : null}

      {records.bestE1RM ? (
        <Card style={styles.card}>
          <Text style={styles.label}>Bestes e1RM</Text>
          <Text style={styles.value}>
            {formatWeightKg(epley1RM(records.bestE1RM.set.weightKg, records.bestE1RM.set.reps))}
          </Text>
          <Text style={styles.date}>{formatDate(records.bestE1RM.set.createdAt)}</Text>
        </Card>
      ) : null}

      {topRepRecords.map(([weightKg, record]) => (
        <Card key={weightKg} style={styles.card}>
          <Text style={styles.label}>Meiste Reps @ {formatWeightKg(weightKg)}</Text>
          <Text style={styles.value}>{record.reps} Wiederholungen</Text>
          <Text style={styles.date}>{formatDate(record.set.createdAt)}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
