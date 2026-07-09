import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { COLORS, SPACING } from '@/lib/constants';

import type { Recommendation } from '../types';

export interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <EmptyState title="Keine Auffälligkeiten" message="Alles im grünen Bereich diese Woche." />
    );
  }

  const warnings = recommendations.filter((r) => r.severity === 'warnung');
  const tips = recommendations.filter((r) => r.severity === 'tipp');

  return (
    <View style={styles.container}>
      {warnings.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.warningTitle]}>Warnungen</Text>
          {warnings.map((rec, index) => (
            <Card key={index} style={[styles.card, styles.warningCard]}>
              <Text style={styles.message}>{rec.message}</Text>
            </Card>
          ))}
        </View>
      ) : null}

      {tips.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.tipTitle]}>Tipps</Text>
          {tips.map((rec, index) => (
            <Card key={index} style={[styles.card, styles.tipCard]}>
              <Text style={styles.message}>{rec.message}</Text>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  warningTitle: {
    color: COLORS.warning,
  },
  tipTitle: {
    color: COLORS.accent,
  },
  card: {
    borderLeftWidth: 3,
  },
  warningCard: {
    borderLeftColor: COLORS.warning,
  },
  tipCard: {
    borderLeftColor: COLORS.accent,
  },
  message: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
});
