import { describe, expect, it } from 'vitest';
import { isCoach } from './coach';

describe('isCoach', () => {
  it('matches the configured coach email', () => {
    expect(isCoach('maurodeluca@live.ie')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isCoach('MauroDeLuca@Live.IE')).toBe(true);
  });

  it('rejects everyone else, including null/undefined', () => {
    expect(isCoach('someone.else@company.com')).toBe(false);
    expect(isCoach(null)).toBe(false);
    expect(isCoach(undefined)).toBe(false);
    expect(isCoach('')).toBe(false);
  });
});
