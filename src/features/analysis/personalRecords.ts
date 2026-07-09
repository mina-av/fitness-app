import { epley1RM } from './oneRepMax';
import type { AnalysisSet } from './types';

export interface PersonalRecords {
  heaviestSet?: AnalysisSet;
  bestE1RM?: { value: number; set: AnalysisSet };
  /** Bestes (=meiste) Reps je exaktem Gewicht. */
  mostRepsAtWeight: Map<number, { reps: number; set: AnalysisSet }>;
}

/**
 * Nur `setType === 'normal'` (und keine Warmups) zählen für Gewichts-PRs.
 * Drop-Sets und Rest-Pause-Sätze sind Ermüdungssätze mit bewusst reduziertem
 * Gewicht/Reps direkt nach einem Arbeitssatz — sie würden sonst falsche
 * "meiste Reps bei diesem Gewicht"-PRs erzeugen. Entscheidung dokumentiert in
 * docs/decisions.md.
 */
function eligibleForPR(set: AnalysisSet): boolean {
  return !set.isWarmup && set.setType === 'normal';
}

export function calculatePersonalRecords(history: AnalysisSet[]): PersonalRecords {
  const eligible = history.filter(eligibleForPR);

  let heaviestSet: AnalysisSet | undefined;
  let bestE1RM: { value: number; set: AnalysisSet } | undefined;
  const mostRepsAtWeight = new Map<number, { reps: number; set: AnalysisSet }>();

  for (const set of eligible) {
    if (!heaviestSet || set.weightKg > heaviestSet.weightKg) {
      heaviestSet = set;
    }

    const e1rm = epley1RM(set.weightKg, set.reps);
    if (!bestE1RM || e1rm > bestE1RM.value) {
      bestE1RM = { value: e1rm, set };
    }

    const existing = mostRepsAtWeight.get(set.weightKg);
    if (!existing || set.reps > existing.reps) {
      mostRepsAtWeight.set(set.weightKg, { reps: set.reps, set });
    }
  }

  return { heaviestSet, bestE1RM, mostRepsAtWeight };
}

/**
 * Prüft, ob `candidate` (bezogen auf `history`, die restliche Historie DER-
 * SELBEN Übung inkl. bereits geloggter Sätze aus dem laufenden Workout, aber
 * exklusive `candidate` selbst) einen neuen PR darstellt: schwerster Satz,
 * bestes e1RM, oder meiste Reps bei einem bereits zuvor trainierten Gewicht.
 * Der allererste gültige Satz einer Übung gilt automatisch als PR (Baseline).
 */
export function isNewPR(candidate: AnalysisSet, history: AnalysisSet[]): boolean {
  if (!eligibleForPR(candidate)) return false;

  const priorHistory = history.filter((s) => eligibleForPR(s) && s.id !== candidate.id);
  if (priorHistory.length === 0) {
    return true;
  }

  const records = calculatePersonalRecords(priorHistory);
  const candidateE1RM = epley1RM(candidate.weightKg, candidate.reps);

  const isHeaviestPR = !records.heaviestSet || candidate.weightKg > records.heaviestSet.weightKg;
  const isE1RMPR = !records.bestE1RM || candidateE1RM > records.bestE1RM.value;
  const bestAtWeight = records.mostRepsAtWeight.get(candidate.weightKg);
  const isRepsPR = bestAtWeight !== undefined && candidate.reps > bestAtWeight.reps;

  return isHeaviestPR || isE1RMPR || isRepsPR;
}
