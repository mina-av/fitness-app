import { brzycki1RM, epley1RM, oneRepMax } from './oneRepMax';

describe('epley1RM', () => {
  it('computes the standard formula for reps > 1', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(100 * (1 + 5 / 30));
  });

  it('returns the weight itself for reps === 1', () => {
    expect(epley1RM(100, 1)).toBe(100);
  });

  it('returns the weight itself for reps === 0 (edge case)', () => {
    expect(epley1RM(100, 0)).toBe(100);
  });
});

describe('brzycki1RM', () => {
  it('computes the standard formula for reps > 1 and < 37', () => {
    expect(brzycki1RM(100, 5)).toBeCloseTo(100 * (36 / 32));
  });

  it('returns the weight itself for reps === 1', () => {
    expect(brzycki1RM(100, 1)).toBe(100);
  });

  it('guards reps >= 37 by falling back to Epley (never NaN/Infinity)', () => {
    const result = brzycki1RM(100, 37);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBe(epley1RM(100, 37));
  });

  it('guards reps far beyond 37', () => {
    const result = brzycki1RM(60, 50);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('oneRepMax', () => {
  it('defaults to Epley', () => {
    expect(oneRepMax(100, 5)).toBe(epley1RM(100, 5));
  });

  it('uses Brzycki when requested', () => {
    expect(oneRepMax(100, 5, 'brzycki')).toBe(brzycki1RM(100, 5));
  });
});
