import { buildHeatmapData, currentStreakWeeks, workoutsPerWeek } from './consistency';
import type { AnalysisSet, AnalysisWorkout } from './types';

function makeSet(overrides: Partial<AnalysisSet> = {}): AnalysisSet {
  return {
    id: 's1',
    exerciseId: 'bench',
    workoutId: 'w1',
    reps: 10,
    weightKg: 80,
    rir: 2,
    setType: 'normal',
    isWarmup: false,
    createdAt: new Date('2026-01-05T10:00:00Z'),
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<AnalysisWorkout> = {}): AnalysisWorkout {
  return {
    id: 'w1',
    date: new Date('2026-01-05T10:00:00Z'),
    finishedAt: new Date('2026-01-05T11:00:00Z'),
    ...overrides,
  };
}

describe('buildHeatmapData', () => {
  it('sums volume per calendar day', () => {
    const sets = [
      makeSet({ createdAt: new Date('2026-01-05T09:00:00Z'), reps: 10, weightKg: 80 }),
      makeSet({ createdAt: new Date('2026-01-05T09:30:00Z'), reps: 5, weightKg: 100 }),
      makeSet({ createdAt: new Date('2026-01-06T09:00:00Z'), reps: 10, weightKg: 50 }),
    ];
    const heatmap = buildHeatmapData(sets);
    expect(heatmap).toEqual(
      expect.arrayContaining([
        { dateKey: '2026-01-05', volume: 800 + 500 },
        { dateKey: '2026-01-06', volume: 500 },
      ]),
    );
  });

  it('excludes warmup sets', () => {
    const sets = [makeSet({ isWarmup: true })];
    expect(buildHeatmapData(sets)).toEqual([]);
  });

  it('returns an empty array with no sets', () => {
    expect(buildHeatmapData([])).toEqual([]);
  });
});

describe('workoutsPerWeek', () => {
  const reference = new Date('2026-01-08T12:00:00Z'); // Thursday, week of 2026-01-05

  it('counts only finished workouts within the week', () => {
    const workouts = [
      makeWorkout({ date: new Date('2026-01-05T10:00:00Z'), finishedAt: new Date() }),
      makeWorkout({ date: new Date('2026-01-06T10:00:00Z'), finishedAt: null }), // unfinished
      makeWorkout({ date: new Date('2025-12-29T10:00:00Z'), finishedAt: new Date() }), // previous week
    ];
    expect(workoutsPerWeek(workouts, 0, reference)).toBe(1);
  });

  it('returns 0 for an empty week', () => {
    expect(workoutsPerWeek([], 0, reference)).toBe(0);
  });

  it('defaults to the current week and offset 0 when not specified', () => {
    const workouts = [makeWorkout({ date: new Date(), finishedAt: new Date() })];
    expect(workoutsPerWeek(workouts)).toBe(1);
  });
});

describe('currentStreakWeeks', () => {
  const reference = new Date('2026-01-19T12:00:00Z'); // Monday, week of 2026-01-19

  it('counts consecutive trained weeks ending at the current week', () => {
    const workouts = [
      makeWorkout({ date: new Date('2026-01-19T10:00:00Z'), finishedAt: new Date() }), // this week
      makeWorkout({ date: new Date('2026-01-12T10:00:00Z'), finishedAt: new Date() }), // last week
      makeWorkout({ date: new Date('2026-01-05T10:00:00Z'), finishedAt: new Date() }), // 2 weeks ago
    ];
    expect(currentStreakWeeks(workouts, reference)).toBe(3);
  });

  it('stops at the first gap week', () => {
    const workouts = [
      makeWorkout({ date: new Date('2026-01-19T10:00:00Z'), finishedAt: new Date() }),
      // gap in week of 2026-01-12
      makeWorkout({ date: new Date('2026-01-05T10:00:00Z'), finishedAt: new Date() }),
    ];
    expect(currentStreakWeeks(workouts, reference)).toBe(1);
  });

  it('returns 0 with no workouts at all (empty history)', () => {
    expect(currentStreakWeeks([], reference)).toBe(0);
  });

  it('returns 0 when the current week has no workout yet', () => {
    const workouts = [
      makeWorkout({ date: new Date('2026-01-12T10:00:00Z'), finishedAt: new Date() }),
    ];
    expect(currentStreakWeeks(workouts, reference)).toBe(0);
  });

  it('defaults to today as the reference when not specified', () => {
    const workouts = [makeWorkout({ date: new Date(), finishedAt: new Date() })];
    expect(currentStreakWeeks(workouts)).toBeGreaterThanOrEqual(1);
  });
});
