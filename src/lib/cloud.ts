import { supabase } from './supabaseClient';
import type { Category, State } from './progress';

export interface LeaderboardEntry {
  userId: string;
  state: State;
  lastActive: string | null;
}

export interface Week12Details {
  location: string;
  weight: string;
  distance: string;
  gradient: string;
}

const nowIso = () => new Date().toISOString();

/**
 * Extracts a human-readable message from any thrown value. Supabase/Postgrest errors are plain
 * objects (e.g. `{ message, code, details, hint }`), not `instanceof Error`, so a naive
 * `e instanceof Error` check silently swallows the real reason and always falls back.
 */
export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return fallback;
}

/** Pulls this user's saved profile/progress/notes from Supabase, or null if they have none yet. */
export async function fetchMyState(userId: string): Promise<Partial<State> | null> {
  const [{ data: profile }, { data: progress }, { data: notes }] = await Promise.all([
    supabase.from('profiles').select('display_name, category').eq('id', userId).maybeSingle(),
    supabase.from('progress').select('week, exercise_id, amount').eq('user_id', userId),
    supabase.from('notes').select('week, text').eq('user_id', userId),
  ]);

  if (!profile && !progress?.length && !notes?.length) return null;

  const logs: Record<string, number> = {};
  for (const row of progress ?? []) logs[`${row.week}:${row.exercise_id}`] = row.amount;

  const noteMap: Record<number, string> = {};
  for (const row of notes ?? []) noteMap[row.week] = row.text;

  return {
    name: profile?.display_name ?? '',
    category: (profile?.category as Category) ?? 'men',
    logs,
    notes: noteMap,
  };
}

/** Upserts the full current state to Supabase. Only non-zero logs / non-empty notes are stored. */
export async function pushMyState(userId: string, state: State): Promise<void> {
  const updated_at = nowIso();

  await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: state.name, category: state.category, updated_at });

  const progressRows = Object.entries(state.logs)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => {
      const [week, exercise_id] = key.split(':');
      return { user_id: userId, week: Number(week), exercise_id, amount, updated_at };
    });
  if (progressRows.length) {
    await supabase.from('progress').upsert(progressRows, { onConflict: 'user_id,week,exercise_id' });
  }

  const noteRows = Object.entries(state.notes)
    .filter(([, text]) => text.trim())
    .map(([week, text]) => ({ user_id: userId, week: Number(week), text, updated_at }));
  if (noteRows.length) {
    await supabase.from('notes').upsert(noteRows, { onConflict: 'user_id,week' });
  }
}

/** Wipes this user's cloud progress + notes (used by the Reset button). Keeps the profile row. */
export async function wipeMyCloudState(userId: string): Promise<void> {
  await Promise.all([
    supabase.from('progress').delete().eq('user_id', userId),
    supabase.from('notes').delete().eq('user_id', userId),
  ]);
}

/** Everyone's progress, for the leaderboard and coach view. Notes stay private (not fetched here). */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const [{ data: profiles, error: profileErr }, { data: progress, error: progressErr }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, category, updated_at'),
    supabase.from('progress').select('user_id, week, exercise_id, amount, updated_at'),
  ]);
  if (profileErr) throw profileErr;
  if (progressErr) throw progressErr;

  const byUser = new Map<string, Record<string, number>>();
  const lastActiveByUser = new Map<string, string>();
  for (const row of progress ?? []) {
    const logs = byUser.get(row.user_id) ?? {};
    logs[`${row.week}:${row.exercise_id}`] = row.amount;
    byUser.set(row.user_id, logs);
    const prev = lastActiveByUser.get(row.user_id);
    if (!prev || row.updated_at > prev) lastActiveByUser.set(row.user_id, row.updated_at);
  }

  return (profiles ?? []).map((p) => {
    const prev = lastActiveByUser.get(p.id);
    const lastActive = !prev || p.updated_at > prev ? p.updated_at : prev;
    return {
      userId: p.id,
      lastActive: lastActive ?? null,
      state: {
        name: p.display_name || 'Unknown soldier',
        category: (p.category as Category) ?? 'men',
        logs: byUser.get(p.id) ?? {},
        notes: {},
      },
    };
  });
}

/** Week 12's details, revealed by the coach once the instructor announces them. Public read, no sign-in needed. */
export async function fetchWeek12Details(): Promise<Week12Details | null> {
  const { data, error } = await supabase
    .from('week12_details')
    .select('location, weight, distance, gradient')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/** Coach-only write, enforced by RLS (supabase/schema.sql) matching the signed-in email. */
export async function upsertWeek12Details(details: Week12Details): Promise<void> {
  const { error } = await supabase
    .from('week12_details')
    .upsert({ id: 1, ...details, updated_at: nowIso() });
  if (error) throw error;
}
