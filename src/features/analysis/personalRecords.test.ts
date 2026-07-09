import { calculatePersonalRecords, isNewPR } from './personalRecords';
import type { AnalysisSet } from './types';

function makeSet(overrides: Partial<AnalysisSet> = {}): AnalysisSet {
  return {
    id: 'set-1',
    exerciseId: 'bench',
    workoutId: 'workout-1',
    reps: 8,
    weightKg: 80,
    rir: 2,
    setType: 'normal',
    isWarmup: false,
    createdAt: new Date('2026-01-05T10:00:00Z'),
    ...overrides,
  };
}

describe('calculatePersonalRecords', () => {
  it('finds the heaviest set, best e1RM, and most reps per weight', () => {
    const history = [
      makeSet({ id: 's1', weightKg: 80, reps: 8 }),
      makeSet({ id: 's2', weightKg: 85, reps: 5 }),
      makeSet({ id: 's3', weightKg: 80, reps: 10 }),
    ];
    const records = calculatePersonalRecords(history);
    expect(records.heaviestSet?.id).toBe('s2');
    expect(records.mostRepsAtWeight.get(80)?.reps).toBe(10);
  });

  it('excludes warmup sets', () => {
    const history = [makeSet({ id: 'warmup', isWarmup: true, weightKg: 200, reps: 20 })];
    const records = calculatePersonalRecords(history);
    expect(records.heaviestSet).toBeUndefined();
  });

  it('excludes dropset and restpause sets (only normal counts for weight PRs)', () => {
    const history = [
      makeSet({ id: 'drop', setType: 'dropset', weightKg: 200, reps: 3 }),
      makeSet({ id: 'pause', setType: 'restpause', weightKg: 150, reps: 4 }),
    ];
    const records = calculatePersonalRecords(history);
    expect(records.heaviestSet).toBeUndefined();
    expect(records.bestE1RM).toBeUndefined();
  });

  it('keeps the existing best-reps-at-weight entry when a later set has fewer or equal reps', () => {
    const history = [
      makeSet({ id: 's1', weightKg: 80, reps: 10 }),
      makeSet({ id: 's2', weightKg: 80, reps: 8 }),
    ];
    const records = calculatePersonalRecords(history);
    expect(records.mostRepsAtWeight.get(80)?.reps).toBe(10);
  });

  it('returns empty records for an exercise with no history', () => {
    const records = calculatePersonalRecords([]);
    expect(records.heaviestSet).toBeUndefined();
    expect(records.bestE1RM).toBeUndefined();
    expect(records.mostRepsAtWeight.size).toBe(0);
  });
});

describe('isNewPR', () => {
  it('treats the very first valid set for an exercise as a PR (baseline)', () => {
    const candidate = makeSet({ id: 'first' });
    expect(isNewPR(candidate, [])).toBe(true);
  });

  it('is a PR when the candidate is heavier than any previous set', () => {
    const history = [makeSet({ id: 's1', weightKg: 80, reps: 8 })];
    const candidate = makeSet({ id: 's2', weightKg: 82.5, reps: 5 });
    expect(isNewPR(candidate, [...history, candidate])).toBe(true);
  });

  it('is a PR when e1RM improves at a lighter weight with more reps', () => {
    const history = [makeSet({ id: 's1', weightKg: 100, reps: 3 })]; // e1RM ~110
    const candidate = makeSet({ id: 's2', weightKg: 90, reps: 10 }); // e1RM = 120
    expect(isNewPR(candidate, [...history, candidate])).toBe(true);
  });

  it('is a PR when more reps are achieved at a previously-used weight', () => {
    const history = [makeSet({ id: 's1', weightKg: 80, reps: 8 })];
    const candidate = makeSet({ id: 's2', weightKg: 80, reps: 10 });
    expect(isNewPR(candidate, [...history, candidate])).toBe(true);
  });

  it('is NOT a PR for a brand-new (lighter, never-used) weight with unremarkable reps', () => {
    const history = [makeSet({ id: 's1', weightKg: 100, reps: 8 })]; // heaviest + best e1RM
    const candidate = makeSet({ id: 's2', weightKg: 60, reps: 5 });
    expect(isNewPR(candidate, [...history, candidate])).toBe(false);
  });

  it('is NOT a PR when reps/weight match a previous best exactly', () => {
    const history = [makeSet({ id: 's1', weightKg: 80, reps: 8 })];
    const candidate = makeSet({ id: 's2', weightKg: 80, reps: 8 });
    expect(isNewPR(candidate, [...history, candidate])).toBe(false);
  });

  it('warmup sets are never PRs', () => {
    const candidate = makeSet({ id: 'w', isWarmup: true, weightKg: 999, reps: 1 });
    expect(isNewPR(candidate, [])).toBe(false);
  });

  it('dropset/restpause sets are never PRs, even as the first set', () => {
    expect(isNewPR(makeSet({ id: 'd', setType: 'dropset' }), [])).toBe(false);
    expect(isNewPR(makeSet({ id: 'p', setType: 'restpause' }), [])).toBe(false);
  });

  it('excludes the candidate itself from its own history comparison (idempotent re-check)', () => {
    const candidate = makeSet({ id: 'only-set', weightKg: 80, reps: 8 });
    // history contains only the candidate itself → treated as first-ever set → PR
    expect(isNewPR(candidate, [candidate])).toBe(true);
  });
});
