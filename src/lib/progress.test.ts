import { describe, expect, it } from 'vitest';
import { WEEKS } from '../data/programme';
import {
  completedWeeks,
  currentWeekNumber,
  displayDistance,
  exportState,
  formatDistance,
  importState,
  initialState,
  isWeekComplete,
  logKey,
  mergeState,
  nativeDistance,
  overallFraction,
  rankFor,
  streak,
  totals,
  weekFraction,
  type State,
} from './progress';

const completeWeek = (state: State, n: number): State => {
  const logs = { ...state.logs };
  for (const ex of WEEKS[n - 1].exercises) logs[logKey(n, ex.id)] = ex.target;
  return { ...state, logs };
};

describe('programme data', () => {
  it('has 12 weeks with unique exercise ids per week', () => {
    expect(WEEKS).toHaveLength(12);
    for (const w of WEEKS) {
      const ids = w.exercises.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('progress', () => {
  it('starts at zero', () => {
    expect(overallFraction(initialState)).toBe(0);
    expect(completedWeeks(initialState)).toBe(0);
  });

  it('computes partial week progress, capping over-achievement', () => {
    const w1 = WEEKS[0];
    const state: State = {
      ...initialState,
      logs: { [logKey(1, 'run')]: 5, [logKey(1, 'squats')]: 999 },
    };
    expect(weekFraction(state, w1)).toBeCloseTo(2 / 5);
    expect(isWeekComplete(state, w1)).toBe(false);
  });

  it('detects complete weeks and overall completion', () => {
    let state = initialState;
    for (let i = 1; i <= 12; i++) state = completeWeek(state, i);
    expect(completedWeeks(state)).toBe(12);
    expect(overallFraction(state)).toBe(1);
    expect(rankFor(1).name).toBe('Champion');
  });

  it('computes streaks without penalising an unfinished current week', () => {
    let state = completeWeek(initialState, 1);
    state = completeWeek(state, 2);
    expect(streak(state, 3)).toBe(2);
    expect(streak(state, 2)).toBe(2);
    state = completeWeek(state, 4);
    expect(streak(state, 4)).toBe(1);
  });

  it('sums totals by unit, ignoring overshoot', () => {
    const state: State = {
      ...initialState,
      logs: { [logKey(1, 'run')]: 50, [logKey(1, 'row')]: 500 },
    };
    expect(totals(state)).toEqual({ mi: 5, m: 500 });
  });

  it('assigns ranks', () => {
    expect(rankFor(0).name).toBe('Recruit');
    expect(rankFor(0.5).name).toBe('Sergeant');
  });
});

describe('currentWeekNumber', () => {
  it('maps dates to programme weeks', () => {
    expect(currentWeekNumber(new Date(2026, 8, 13))).toBe(0);
    expect(currentWeekNumber(new Date(2026, 8, 14))).toBe(1);
    expect(currentWeekNumber(new Date(2026, 8, 20, 23, 59))).toBe(1);
    expect(currentWeekNumber(new Date(2026, 8, 21))).toBe(2);
    expect(currentWeekNumber(new Date(2026, 10, 13))).toBe(9);
    expect(currentWeekNumber(new Date(2026, 10, 30))).toBe(12);
    expect(currentWeekNumber(new Date(2026, 11, 11, 20))).toBe(12);
    expect(currentWeekNumber(new Date(2026, 11, 12))).toBe(13);
  });
});

describe('distance unit conversion', () => {
  it('converts between miles and km', () => {
    expect(displayDistance(10, 'mi')).toBe(10);
    expect(displayDistance(10, 'km')).toBeCloseTo(16.09344);
    expect(nativeDistance(16.09344, 'km')).toBeCloseTo(10);
    expect(nativeDistance(10, 'mi')).toBe(10);
  });

  it('formats a distance with the right suffix and rounding', () => {
    expect(formatDistance(15, 'mi')).toBe('15 mi');
    expect(formatDistance(15, 'km')).toBe('24.1 km');
  });
});

describe('mergeState', () => {
  it('takes the higher logged amount per exercise from either side', () => {
    const local: State = { ...initialState, logs: { [logKey(1, 'run')]: 2, [logKey(1, 'squats')]: 100 } };
    const cloud = { logs: { [logKey(1, 'run')]: 5, [logKey(2, 'row')]: 1000 } };
    const merged = mergeState(local, cloud);
    expect(merged.logs).toEqual({
      [logKey(1, 'run')]: 5,
      [logKey(1, 'squats')]: 100,
      [logKey(2, 'row')]: 1000,
    });
  });

  it('prefers non-empty local notes but fills in from the cloud otherwise', () => {
    const local: State = { ...initialState, notes: { 1: 'local note', 2: '' } };
    const cloud = { notes: { 1: 'cloud note', 2: 'cloud note 2', 3: 'cloud note 3' } };
    expect(mergeState(local, cloud).notes).toEqual({ 1: 'local note', 2: 'cloud note 2', 3: 'cloud note 3' });
  });

  it('only takes cloud name/category on a completely fresh local install', () => {
    const fresh: State = { ...initialState };
    expect(mergeState(fresh, { name: 'Rocky', category: 'women' })).toMatchObject({
      name: 'Rocky',
      category: 'women',
    });

    const existing: State = { ...initialState, name: 'Apollo', category: 'men' };
    expect(mergeState(existing, { name: 'Rocky', category: 'women' })).toMatchObject({
      name: 'Apollo',
      category: 'men',
    });
  });
});

describe('backup', () => {
  it('round-trips state', () => {
    const state: State = {
      name: 'Rocky',
      category: 'women',
      logs: { [logKey(1, 'run')]: 3 },
      notes: { 1: 'Tough one' },
    };
    expect(importState(exportState(state))).toEqual(state);
  });

  it('rejects junk and sanitises bad values', () => {
    expect(() => importState('{"hello":1}')).toThrow();
    expect(() => importState('not json')).toThrow();
    const s = importState('{"logs":{"1:run":-4,"1:row":"x","1:squats":10}}');
    expect(s.logs).toEqual({ '1:squats': 10 });
  });
});
