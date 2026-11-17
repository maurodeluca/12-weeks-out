import { describe, expect, it } from 'vitest';
import { formatRelative, medalFor } from './format';

describe('formatRelative', () => {
  const now = new Date(2026, 10, 16, 12, 0);

  it('handles never-active', () => {
    expect(formatRelative(null, now)).toBe('never');
  });

  it('labels today and yesterday', () => {
    expect(formatRelative(new Date(2026, 10, 16, 8, 0).toISOString(), now)).toBe('today');
    expect(formatRelative(new Date(2026, 10, 15, 23, 0).toISOString(), now)).toBe('yesterday');
  });

  it('counts days for up to two weeks', () => {
    expect(formatRelative(new Date(2026, 10, 10).toISOString(), now)).toBe('6 days ago');
  });

  it('falls back to a plain date beyond two weeks', () => {
    expect(formatRelative(new Date(2026, 9, 1).toISOString(), now)).toBe('1 Oct');
  });
});

describe('medalFor', () => {
  it('gives medals for the top 3 and plain numbers after', () => {
    expect(medalFor(1)).toBe('🥇');
    expect(medalFor(2)).toBe('🥈');
    expect(medalFor(3)).toBe('🥉');
    expect(medalFor(4)).toBe('4');
    expect(medalFor(10)).toBe('10');
  });
});
