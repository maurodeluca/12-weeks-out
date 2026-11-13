import { END_DATE, START_DATE, WEEKS, type Exercise, type Unit, type Week } from '../data/programme';

export type Category = 'men' | 'women';

export interface State {
  name: string;
  category: Category;
  /** Logged amount per `${week}:${exerciseId}`. */
  logs: Record<string, number>;
  notes: Record<number, string>;
}

export const initialState: State = { name: '', category: 'men', logs: {}, notes: {} };

export const logKey = (week: number, exerciseId: string) => `${week}:${exerciseId}`;

export const getDone = (state: State, week: number, ex: Exercise) =>
  state.logs[logKey(week, ex.id)] ?? 0;

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function exerciseFraction(done: number, ex: Exercise): number {
  return ex.target > 0 ? clamp(done / ex.target, 0, 1) : 0;
}

export function weekFraction(state: State, week: Week): number {
  if (week.exercises.length === 0) return 0;
  const sum = week.exercises.reduce(
    (acc, ex) => acc + exerciseFraction(getDone(state, week.week, ex), ex),
    0,
  );
  return sum / week.exercises.length;
}

export const isWeekComplete = (state: State, week: Week) =>
  week.exercises.every((ex) => getDone(state, week.week, ex) >= ex.target);

export function overallFraction(state: State, weeks: Week[] = WEEKS): number {
  const total = weeks.reduce((a, w) => a + w.exercises.length, 0);
  const sum = weeks.reduce(
    (a, w) =>
      a +
      w.exercises.reduce((b, ex) => b + exerciseFraction(getDone(state, w.week, ex), ex), 0),
    0,
  );
  return total ? sum / total : 0;
}

export const completedWeeks = (state: State, weeks: Week[] = WEEKS) =>
  weeks.filter((w) => isWeekComplete(state, w)).length;

/** Consecutive completed weeks ending at `currentWeek`; an unfinished current week doesn't break the run. */
export function streak(state: State, currentWeek: number, weeks: Week[] = WEEKS): number {
  let n = 0;
  for (let w = Math.min(currentWeek, weeks.length); w >= 1; w--) {
    if (isWeekComplete(state, weeks[w - 1])) n++;
    else if (w !== currentWeek) break;
  }
  return n;
}

export function totals(state: State, weeks: Week[] = WEEKS): Partial<Record<Unit, number>> {
  const out: Partial<Record<Unit, number>> = {};
  for (const w of weeks) {
    for (const ex of w.exercises) {
      const d = Math.min(getDone(state, w.week, ex), ex.target);
      if (d > 0) out[ex.unit] = (out[ex.unit] ?? 0) + d;
    }
  }
  return out;
}

const DAY = 86_400_000;

export function weekStart(week: number, start = START_DATE): Date {
  const [y, m, d] = start.split('-').map(Number);
  return new Date(y, m - 1, d + (week - 1) * 7);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const parseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Last day of a week; the final week runs on to the programme end date (11 Dec), not just 7 days. */
export function weekEnd(week: number, weeks = WEEKS.length): Date {
  if (week >= weeks) return parseDate(END_DATE);
  const s = weekStart(week);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
}

/** 0 = before the programme starts, 1..12 = in progress, 13 = programme over. */
export function currentWeekNumber(now: Date, weeks = WEEKS.length, start = START_DATE): number {
  const today = startOfDay(now);
  const days = Math.round((today.getTime() - weekStart(1, start).getTime()) / DAY);
  if (days < 0) return 0;
  if (today.getTime() > parseDate(END_DATE).getTime()) return weeks + 1;
  return Math.min(Math.floor(days / 7) + 1, weeks);
}

export const RANKS = [
  { min: 0, name: 'Recruit', blurb: 'Boots laced. Nobody gets here by accident.' },
  { min: 0.1, name: 'Private', blurb: 'You showed up. Keep showing up.' },
  { min: 0.3, name: 'Corporal', blurb: 'The habit is forming. Do not stop now.' },
  { min: 0.5, name: 'Sergeant', blurb: 'Halfway. This is where champions are made.' },
  { min: 0.75, name: 'Captain', blurb: 'The hard yards are behind you. Finish strong.' },
  { min: 1, name: 'Champion', blurb: 'Programme complete. You went the distance.' },
] as const;

export const rankFor = (fraction: number) =>
  [...RANKS].reverse().find((r) => fraction >= r.min) ?? RANKS[0];

export const STEP: Record<Unit, number> = { mi: 1, m: 100, reps: 10, done: 1 };

export function formatAmount(n: number, unit: Unit): string {
  const v = Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  const s = v.toLocaleString('en-IE');
  if (unit === 'mi') return `${s} mi`;
  if (unit === 'm') return `${s}m`;
  if (unit === 'reps') return s;
  return s;
}

export function exportState(state: State): string {
  return JSON.stringify({ app: '12-weeks-out', version: 1, state }, null, 2);
}

export function importState(json: string): State {
  const parsed = JSON.parse(json);
  const s = parsed?.state ?? parsed;
  if (!s || typeof s !== 'object' || typeof s.logs !== 'object' || s.logs === null) {
    throw new Error('Not a valid 12 Weeks Out backup file.');
  }
  const logs: Record<string, number> = {};
  for (const [k, v] of Object.entries(s.logs as Record<string, unknown>)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) logs[k] = v;
  }
  const notes: Record<number, string> = {};
  for (const [k, v] of Object.entries((s.notes ?? {}) as Record<string, unknown>)) {
    if (typeof v === 'string') notes[Number(k)] = v;
  }
  return {
    name: typeof s.name === 'string' ? s.name : '',
    category: s.category === 'women' ? 'women' : 'men',
    logs,
    notes,
  };
}
