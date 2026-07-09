import { compareWeeks, detectStagnation } from './trends';
import type { AnalysisSet } from './types';

function makeSet(overrides: Partial<AnalysisSet> = {}): AnalysisSet {
  return {
    id: 's1',
    exerciseId: 'bench',
    workoutId: 'w1',
    reps: 8,
    weightKg: 80,
    rir: 2,
    setType: 'normal',
    isWarmup: false,
    createdAt: new Date('2026-02-02T10:00:00Z'), // Monday
    ...overrides,
  };
}

// Montage der Wochen (Wochenstart Montag): offset 0 = 2026-02-02..08,
// -1 = 2026-01-26..02-01, -2 = 2026-01-19..25, -3 = 2026-01-12..18.
const REFERENCE = new Date('2026-02-02T12:00:00Z');
const WEEK0 = new Date('2026-02-03T10:00:00Z');
const WEEK_1 = new Date('2026-01-27T10:00:00Z');
const WEEK_2 = new Date('2026-01-20T10:00:00Z');
const WEEK_3 = new Date('2026-01-13T10:00:00Z');

describe('compareWeeks', () => {
  it('computes a positive percent change vs. the previous week', () => {
    const sets = [
      makeSet({ id: 'cur', createdAt: WEEK0, reps: 10, weightKg: 100 }), // 1000
      makeSet({ id: 'prev', createdAt: WEEK_1, reps: 10, weightKg: 50 }), // 500
    ];
    const result = compareWeeks(sets, 0, REFERENCE);
    expect(result.currentVolume).toBe(1000);
    expect(result.previousVolume).toBe(500);
    expect(result.volumeChangePercent).toBeCloseTo(100);
  });

  it('returns null percent change when there is no previous-week data (first week of usage)', () => {
    const sets = [makeSet({ createdAt: WEEK0 })];
    const result = compareWeeks(sets, 0, REFERENCE);
    expect(result.volumeChangePercent).toBeNull();
  });

  it('handles a completely empty set list', () => {
    const result = compareWeeks([], 0, REFERENCE);
    expect(result).toEqual({ currentVolume: 0, previousVolume: 0, volumeChangePercent: null });
  });
});

describe('detectStagnation', () => {
  it('does not flag stagnation with too little history (fewer than threshold+1 weeks of data)', () => {
    const sets = [
      makeSet({ id: 's1', createdAt: WEEK0, weightKg: 80, reps: 8 }),
      makeSet({ id: 's2', createdAt: WEEK_1, weightKg: 80, reps: 8 }),
    ];
    const result = detectStagnation(sets, REFERENCE);
    expect(result.isStagnating).toBe(false);
  });

  it('flags stagnation when e1RM has not improved over the last 3 weeks with data', () => {
    const sets = [
      makeSet({ id: 's0', createdAt: WEEK0, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's1', createdAt: WEEK_1, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's2', createdAt: WEEK_2, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's3', createdAt: WEEK_3, weightKg: 80, reps: 8, rir: 2 }),
    ];
    const result = detectStagnation(sets, REFERENCE);
    expect(result.isStagnating).toBe(true);
    expect(result.weeksWithoutImprovement).toBe(3);
  });

  it('does not flag stagnation when e1RM improved this week', () => {
    const sets = [
      makeSet({ id: 's0', createdAt: WEEK0, weightKg: 85, reps: 8, rir: 2 }), // heavier
      makeSet({ id: 's1', createdAt: WEEK_1, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's2', createdAt: WEEK_2, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's3', createdAt: WEEK_3, weightKg: 80, reps: 8, rir: 2 }),
    ];
    const result = detectStagnation(sets, REFERENCE);
    expect(result.isStagnating).toBe(false);
  });

  it('treats a lower RIR at the same weight/reps as progress, not stagnation', () => {
    const sets = [
      makeSet({ id: 's0', createdAt: WEEK0, weightKg: 80, reps: 8, rir: 0 }), // same load, less reserve
      makeSet({ id: 's1', createdAt: WEEK_1, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's2', createdAt: WEEK_2, weightKg: 80, reps: 8, rir: 2 }),
      makeSet({ id: 's3', createdAt: WEEK_3, weightKg: 80, reps: 8, rir: 2 }),
    ];
    const result = detectStagnation(sets, REFERENCE);
    expect(result.isStagnating).toBe(false);
  });

  it('flags stagnation when e1RM regressed this week (lower weight, no RIR data)', () => {
    const sets = [
      makeSet({ id: 's0', createdAt: WEEK0, weightKg: 70, reps: 8, rir: null }),
      makeSet({ id: 's1', createdAt: WEEK_1, weightKg: 80, reps: 8, rir: null }),
      makeSet({ id: 's2', createdAt: WEEK_2, weightKg: 80, reps: 8, rir: null }),
      makeSet({ id: 's3', createdAt: WEEK_3, weightKg: 80, reps: 8, rir: null }),
    ];
    const result = detectStagnation(sets, REFERENCE);
    expect(result.isStagnating).toBe(true);
  });

  it('does not crash and reports no stagnation for an exercise with no history', () => {
    const result = detectStagnation([], REFERENCE);
    expect(result).toEqual({ isStagnating: false, weeksWithoutImprovement: 0 });
  });

  it('treats warmup-only weeks as having no data (skipped, not counted as non-improvement)', () => {
    const sets = [makeSet({ id: 's0', createdAt: WEEK0, weightKg: 80, reps: 8, isWarmup: true })];
    const result = detectStagnation(sets, REFERENCE);
    expect(result.isStagnating).toBe(false);
  });
});
