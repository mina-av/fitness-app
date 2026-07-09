import type { AnalysisExercise, AnalysisSet } from './types';
import {
  setVolume,
  totalVolume,
  volumeByExercise,
  volumeByMuscleGroup,
  weeklyVolumeReport,
} from './volume';

function makeSet(overrides: Partial<AnalysisSet> = {}): AnalysisSet {
  return {
    id: 'set-1',
    exerciseId: 'bench',
    workoutId: 'workout-1',
    reps: 10,
    weightKg: 80,
    rir: 2,
    setType: 'normal',
    isWarmup: false,
    createdAt: new Date('2026-01-05T10:00:00Z'), // Monday
    ...overrides,
  };
}

const exercises: AnalysisExercise[] = [
  { id: 'bench', muscleGroup: 'brust', secondaryMuscles: ['schultern', 'arme'] },
  { id: 'squat', muscleGroup: 'beine', secondaryMuscles: [] },
];

describe('setVolume / totalVolume', () => {
  it('multiplies reps by weight', () => {
    expect(setVolume(makeSet({ reps: 10, weightKg: 80 }))).toBe(800);
  });

  it('excludes warmup sets from total volume', () => {
    const sets = [
      makeSet({ isWarmup: true, reps: 20, weightKg: 20 }),
      makeSet({ reps: 10, weightKg: 80 }),
    ];
    expect(totalVolume(sets)).toBe(800);
  });

  it('returns 0 for an empty set list', () => {
    expect(totalVolume([])).toBe(0);
  });

  it('returns 0 when only warmups are present', () => {
    expect(totalVolume([makeSet({ isWarmup: true })])).toBe(0);
  });
});

describe('volumeByExercise', () => {
  it('aggregates volume per exercise, excluding warmups', () => {
    const sets = [
      makeSet({ exerciseId: 'bench', reps: 10, weightKg: 80 }),
      makeSet({ exerciseId: 'bench', reps: 8, weightKg: 82.5 }),
      makeSet({ exerciseId: 'squat', reps: 5, weightKg: 100 }),
      makeSet({ exerciseId: 'squat', isWarmup: true, reps: 15, weightKg: 40 }),
    ];
    const result = volumeByExercise(sets);
    expect(result).toEqual(
      expect.arrayContaining([
        { exerciseId: 'bench', volume: 10 * 80 + 8 * 82.5 },
        { exerciseId: 'squat', volume: 5 * 100 },
      ]),
    );
  });
});

describe('volumeByMuscleGroup', () => {
  it('counts primary muscle group at full volume and secondary at 0.5x', () => {
    const sets = [makeSet({ exerciseId: 'bench', reps: 10, weightKg: 80 })];
    const result = volumeByMuscleGroup(sets, exercises);

    expect(result).toEqual(
      expect.arrayContaining([
        { muscleGroup: 'brust', volume: 800 },
        { muscleGroup: 'schultern', volume: 400 },
        { muscleGroup: 'arme', volume: 400 },
      ]),
    );
  });

  it('skips sets whose exercise is not in the provided exercise list', () => {
    const sets = [makeSet({ exerciseId: 'unknown-exercise' })];
    expect(volumeByMuscleGroup(sets, exercises)).toEqual([]);
  });

  it('returns an empty array for an empty week', () => {
    expect(volumeByMuscleGroup([], exercises)).toEqual([]);
  });

  it('excludes warmup sets', () => {
    const sets = [makeSet({ exerciseId: 'bench', isWarmup: true, reps: 20, weightKg: 20 })];
    expect(volumeByMuscleGroup(sets, exercises)).toEqual([]);
  });
});

describe('weeklyVolumeReport', () => {
  it('only includes sets within the requested week', () => {
    const reference = new Date('2026-01-08T12:00:00Z'); // Thursday of the week starting 2026-01-05
    const sets = [
      makeSet({ createdAt: new Date('2026-01-05T10:00:00Z'), reps: 10, weightKg: 80 }), // in week
      makeSet({ createdAt: new Date('2025-12-29T10:00:00Z'), reps: 10, weightKg: 80 }), // previous week
    ];
    const report = weeklyVolumeReport(sets, exercises, 0, reference);
    expect(report.total).toBe(800);
  });

  it('handles an empty week with no data (first week of usage)', () => {
    const report = weeklyVolumeReport([], exercises, 0, new Date('2026-01-08T12:00:00Z'));
    expect(report).toEqual({ total: 0, byExercise: [], byMuscleGroup: [] });
  });

  it('defaults to the current week and offset 0 when not specified', () => {
    const sets = [makeSet({ createdAt: new Date(), reps: 10, weightKg: 80 })];
    const report = weeklyVolumeReport(sets, exercises);
    expect(report.total).toBe(800);
  });
});
