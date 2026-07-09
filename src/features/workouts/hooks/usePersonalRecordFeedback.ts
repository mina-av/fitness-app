import { useCallback } from 'react';

import { isNewPR as isNewPRPure } from '@/features/analysis/personalRecords';
import type { AnalysisSet } from '@/features/analysis/types';

/**
 * Feature-Flag für das PR-Feedback beim Satz-Eintragen. Die Berechnung kommt
 * aus `src/features/analysis/personalRecords.ts` (reine Funktion, kein DB-
 * /React-Import dort) — `src/features/analysis` wird hier bewusst wie
 * `src/lib` behandelt (reine, zustandslose Berechnungs-Utilities), nicht wie
 * ein normales Feature; siehe docs/decisions.md.
 */
export const PR_FEEDBACK_ENABLED = true;

export interface PersonalRecordFeedback {
  isNewPR: boolean;
}

export function usePersonalRecordFeedback() {
  const checkForPR = useCallback(
    (candidateSet: AnalysisSet, history: AnalysisSet[]): PersonalRecordFeedback => {
      if (!PR_FEEDBACK_ENABLED) {
        return { isNewPR: false };
      }
      return { isNewPR: isNewPRPure(candidateSet, history) };
    },
    [],
  );

  return { checkForPR };
}
