import { generateRecommendations } from './rules';
import type { AnalysisExercise, AnalysisSet, AnalysisWorkout } from './types';

function makeSet(overrides: Partial<AnalysisSet> = {}): AnalysisSet {
  return {
    id: `set-${Math.random()}`,
    exerciseId: 'bench',
    workoutId: 'workout-1',
    reps: 8,
    weightKg: 80,
    rir: 2,
    setType: 'normal',
    isWarmup: false,
    createdAt: WEEK0,
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<AnalysisWorkout> = {}): AnalysisWorkout {
  return {
    id: `workout-${Math.random()}`,
    date: WEEK0,
    finishedAt: WEEK0,
    ...overrides,
  };
}

const exercises: AnalysisExercise[] = [
  { id: 'bench', muscleGroup: 'brust', secondaryMuscles: ['schultern', 'arme'] },
  { id: 'squat', muscleGroup: 'beine', secondaryMuscles: [] },
  { id: 'curl', muscleGroup: 'arme', secondaryMuscles: [] },
];

// Wochenraster (Wochenstart Montag): offset 0 = 2026-02-02..08, -1 = 01-26..02-01,
// -2 = 01-19..25, -3 = 01-12..18.
const REFERENCE = new Date('2026-02-02T12:00:00Z');
const WEEK0 = new Date('2026-02-03T10:00:00Z');
const WEEK_1 = new Date('2026-01-27T10:00:00Z');
const WEEK_2 = new Date('2026-01-20T10:00:00Z');
const WEEK_3 = new Date('2026-01-13T10:00:00Z');

function baseInput(overrides: Partial<Parameters<typeof generateRecommendations>[0]> = {}) {
  return {
    sets: [] as AnalysisSet[],
    exercises,
    workouts: [] as AnalysisWorkout[],
    exerciseTargetRepsMax: new Map<string, number>(),
    weekOffset: 0,
    reference: REFERENCE,
    ...overrides,
  };
}

describe('generateRecommendations — empty/edge inputs', () => {
  it('returns only the consistency hint for completely empty input (0 workouts logged)', () => {
    const recs = generateRecommendations(baseInput());
    expect(recs).toEqual([expect.objectContaining({ type: 'consistency' })]);
  });

  it('does not crash and yields no progression/stagnation recs for a warmup-only week', () => {
    const sets = [makeSet({ isWarmup: true, reps: 20, weightKg: 20 })];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs.find((r) => r.type === 'progression')).toBeUndefined();
  });

  it('handles an exercise with no history at all gracefully (no crash)', () => {
    expect(() => generateRecommendations(baseInput({ sets: [] }))).not.toThrow();
  });
});

describe('rule 1 — progression suggestion', () => {
  it('suggests +2.5kg when all working sets meet/exceed target reps at RIR >= 2', () => {
    const targets = new Map([['bench', 8]]);
    const sets = [
      makeSet({ reps: 8, rir: 2 }),
      makeSet({ reps: 9, rir: 3 }),
      makeSet({ reps: 8, rir: 2 }),
    ];
    const recs = generateRecommendations(baseInput({ sets, exerciseTargetRepsMax: targets }));
    expect(recs).toContainEqual(
      expect.objectContaining({ type: 'progression', severity: 'tipp', exerciseId: 'bench' }),
    );
  });

  it('does NOT suggest progression when one set is below target reps', () => {
    const targets = new Map([['bench', 8]]);
    const sets = [makeSet({ reps: 8, rir: 2 }), makeSet({ reps: 6, rir: 2 })];
    const recs = generateRecommendations(baseInput({ sets, exerciseTargetRepsMax: targets }));
    expect(recs.find((r) => r.type === 'progression')).toBeUndefined();
  });

  it('does NOT suggest progression when RIR is below 2', () => {
    const targets = new Map([['bench', 8]]);
    const sets = [makeSet({ reps: 10, rir: 1 })];
    const recs = generateRecommendations(baseInput({ sets, exerciseTargetRepsMax: targets }));
    expect(recs.find((r) => r.type === 'progression')).toBeUndefined();
  });

  it('does NOT suggest progression when RIR was not logged (null)', () => {
    const targets = new Map([['bench', 8]]);
    const sets = [makeSet({ reps: 10, rir: null })];
    const recs = generateRecommendations(baseInput({ sets, exerciseTargetRepsMax: targets }));
    expect(recs.find((r) => r.type === 'progression')).toBeUndefined();
  });

  it('falls back to a default target of 12 reps when no template target exists', () => {
    const sets = [makeSet({ reps: 12, rir: 2 })];
    const recsHit = generateRecommendations(baseInput({ sets }));
    expect(recsHit.find((r) => r.type === 'progression')).toBeDefined();

    const recsMiss = generateRecommendations(baseInput({ sets: [makeSet({ reps: 11, rir: 2 })] }));
    expect(recsMiss.find((r) => r.type === 'progression')).toBeUndefined();
  });

  it('ignores dropset/restpause sets for the progression check', () => {
    const targets = new Map([['bench', 8]]);
    const sets = [makeSet({ reps: 8, rir: 2 }), makeSet({ reps: 2, rir: 0, setType: 'dropset' })];
    const recs = generateRecommendations(baseInput({ sets, exerciseTargetRepsMax: targets }));
    expect(recs.find((r) => r.type === 'progression')).toBeDefined();
  });
});

describe('rule 2 — stagnation warning', () => {
  it('warns when e1RM has not improved over the last 3 weeks', () => {
    const sets = [
      makeSet({ id: 's0', createdAt: WEEK0 }),
      makeSet({ id: 's1', createdAt: WEEK_1 }),
      makeSet({ id: 's2', createdAt: WEEK_2 }),
      makeSet({ id: 's3', createdAt: WEEK_3 }),
    ];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs).toContainEqual(
      expect.objectContaining({ type: 'stagnation', severity: 'warnung', exerciseId: 'bench' }),
    );
  });

  it('does NOT warn when the exercise only has one week of history (first usage)', () => {
    const sets = [makeSet({ createdAt: WEEK0 })];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs.find((r) => r.type === 'stagnation')).toBeUndefined();
  });

  it('does NOT warn when e1RM improved this week', () => {
    const sets = [
      makeSet({ id: 's0', createdAt: WEEK0, weightKg: 90 }),
      makeSet({ id: 's1', createdAt: WEEK_1, weightKg: 80 }),
      makeSet({ id: 's2', createdAt: WEEK_2, weightKg: 80 }),
      makeSet({ id: 's3', createdAt: WEEK_3, weightKg: 80 }),
    ];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs.find((r) => r.type === 'stagnation')).toBeUndefined();
  });
});

describe('rule 3 — overload warning', () => {
  it('warns when weekly volume for a muscle group spikes >30% vs. the 3-week average', () => {
    const sets = [
      makeSet({ id: 'c1', createdAt: WEEK0, reps: 20, weightKg: 100 }), // 2000 this week
      makeSet({ id: 'p1', createdAt: WEEK_1, reps: 10, weightKg: 100 }), // 1000
      makeSet({ id: 'p2', createdAt: WEEK_2, reps: 10, weightKg: 100 }), // 1000
      makeSet({ id: 'p3', createdAt: WEEK_3, reps: 10, weightKg: 100 }), // 1000
    ];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs).toContainEqual(
      expect.objectContaining({ type: 'overload', severity: 'warnung', muscleGroup: 'brust' }),
    );
  });

  it('warns when every set for a muscle group this week is logged at RIR 0', () => {
    const sets = [
      makeSet({ id: 's1', createdAt: WEEK0, rir: 0 }),
      makeSet({ id: 's2', createdAt: WEEK0, rir: 0 }),
    ];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs).toContainEqual(
      expect.objectContaining({ type: 'overload', severity: 'warnung', muscleGroup: 'brust' }),
    );
  });

  it('does NOT warn for stable volume and mixed RIR', () => {
    const sets = [
      makeSet({ id: 'c1', createdAt: WEEK0, reps: 10, weightKg: 100, rir: 2 }),
      makeSet({ id: 'p1', createdAt: WEEK_1, reps: 10, weightKg: 100 }),
      makeSet({ id: 'p2', createdAt: WEEK_2, reps: 10, weightKg: 100 }),
      makeSet({ id: 'p3', createdAt: WEEK_3, reps: 10, weightKg: 100 }),
    ];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs.find((r) => r.type === 'overload')).toBeUndefined();
  });
});

describe('rule 4 — undervolume warning', () => {
  it('warns when a regularly-trained muscle group has fewer than 10 working sets this week', () => {
    const sets = [
      // "grundsätzlich trainiert": some historical sets for beine in a prior week
      makeSet({ id: 'hist', exerciseId: 'squat', createdAt: WEEK_1 }),
      // only 3 sets this week
      makeSet({ id: 's1', exerciseId: 'squat', createdAt: WEEK0 }),
      makeSet({ id: 's2', exerciseId: 'squat', createdAt: WEEK0 }),
      makeSet({ id: 's3', exerciseId: 'squat', createdAt: WEEK0 }),
    ];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs).toContainEqual(
      expect.objectContaining({ type: 'undervolume', severity: 'warnung', muscleGroup: 'beine' }),
    );
  });

  it('does NOT warn for a muscle group the user never trains at all', () => {
    // No sets reference "core" at all, in this week or any other.
    const sets = [makeSet({ id: 's1', exerciseId: 'bench', createdAt: WEEK0 })];
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs.find((r) => r.type === 'undervolume' && r.muscleGroup === 'core')).toBeUndefined();
  });

  it('does NOT warn when 10+ sets were logged this week for the group', () => {
    const sets = Array.from({ length: 10 }, (_, i) =>
      makeSet({ id: `s${i}`, exerciseId: 'squat', createdAt: WEEK0 }),
    );
    const recs = generateRecommendations(baseInput({ sets }));
    expect(recs.find((r) => r.type === 'undervolume' && r.muscleGroup === 'beine')).toBeUndefined();
  });

  it('ignores sets referencing an exercise that is not in the provided exercise list', () => {
    const sets = [makeSet({ id: 's1', exerciseId: 'unknown-exercise', createdAt: WEEK0 })];
    expect(() => generateRecommendations(baseInput({ sets }))).not.toThrow();
    expect(
      generateRecommendations(baseInput({ sets })).find((r) => r.type === 'undervolume'),
    ).toBeUndefined();
  });
});

describe('rule 5 — consistency hint', () => {
  it('hints when fewer than 2 workouts were completed this week', () => {
    const workouts = [makeWorkout({ date: WEEK0, finishedAt: WEEK0 })];
    const recs = generateRecommendations(baseInput({ workouts }));
    expect(recs).toContainEqual(expect.objectContaining({ type: 'consistency', severity: 'tipp' }));
  });

  it('hints when zero workouts were completed this week', () => {
    const recs = generateRecommendations(baseInput({ workouts: [] }));
    expect(recs).toContainEqual(expect.objectContaining({ type: 'consistency', severity: 'tipp' }));
  });

  it('does NOT hint when 2+ workouts were completed this week', () => {
    const workouts = [
      makeWorkout({ id: 'w1', date: WEEK0, finishedAt: WEEK0 }),
      makeWorkout({ id: 'w2', date: WEEK0, finishedAt: WEEK0 }),
    ];
    const recs = generateRecommendations(baseInput({ workouts }));
    expect(recs.find((r) => r.type === 'consistency')).toBeUndefined();
  });

  it('does not count an unfinished workout towards consistency', () => {
    const workouts = [
      makeWorkout({ id: 'w1', date: WEEK0, finishedAt: WEEK0 }),
      makeWorkout({ id: 'w2', date: WEEK0, finishedAt: null }),
    ];
    const recs = generateRecommendations(baseInput({ workouts }));
    expect(recs).toContainEqual(expect.objectContaining({ type: 'consistency' }));
  });
});
