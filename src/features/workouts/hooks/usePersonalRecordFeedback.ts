import { useCallback } from 'react';

import type { WorkoutSet } from '@/db/schema';

/**
 * Feature-Flag für das PR-Feedback beim Satz-Eintragen (Phase 3 UI).
 * Die echte Berechnung kommt aus `src/features/analysis/personalRecords.ts`
 * (Phase 4, pure functions, noch nicht vorhanden). Bis dahin liefert dieser
 * Hook einen Platzhalter, der nie einen PR meldet — die UI (Badge/Konfetti)
 * ist bereits verdrahtet und muss in Phase 4 nicht mehr angefasst werden.
 */
export const PR_FEEDBACK_ENABLED = false;

export interface PersonalRecordFeedback {
  isNewPR: boolean;
}

/**
 * Platzhalter für `isNewPR(candidateSet, history)` aus Phase 4.
 * TODO(Phase 4): durch echten Aufruf von personalRecords.ts ersetzen, sobald
 * die Analyse-Schicht existiert.
 */
export function usePersonalRecordFeedback() {
  const checkForPR = useCallback(
    (
      _candidateSet: Pick<WorkoutSet, 'exerciseId' | 'reps' | 'weightKg' | 'isWarmup' | 'setType'>,
    ): PersonalRecordFeedback => {
      if (!PR_FEEDBACK_ENABLED) {
        return { isNewPR: false };
      }
      return { isNewPR: false };
    },
    [],
  );

  return { checkForPR };
}
