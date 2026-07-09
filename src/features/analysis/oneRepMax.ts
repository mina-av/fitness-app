export type OneRepMaxFormula = 'epley' | 'brzycki';

/** Epley: w * (1 + reps/30). Bei reps <= 1 ist das Gewicht selbst das 1RM. */
export function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/**
 * Brzycki: w * 36 / (37 - reps). Für reps >= 37 wird der Nenner <= 0 (Formel
 * nicht definiert) — Guard: fällt in dem Fall auf Epley zurück, damit die
 * Funktion nie NaN/Infinity liefert (Entscheidung in docs/decisions.md).
 */
export function brzycki1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  if (reps >= 37) return epley1RM(weightKg, reps);
  return weightKg * (36 / (37 - reps));
}

export function oneRepMax(
  weightKg: number,
  reps: number,
  formula: OneRepMaxFormula = 'epley',
): number {
  return formula === 'epley' ? epley1RM(weightKg, reps) : brzycki1RM(weightKg, reps);
}
