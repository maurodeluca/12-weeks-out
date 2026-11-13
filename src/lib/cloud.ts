import { supabase } from './supabaseClient';
import type { Category, State } from './progress';

export interface LeaderboardEntry {
  userId: string;
  state: State;
}

const nowIso = () => new Date().toISOString();

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

/** Everyone's progress, for the leaderboard. Notes stay private (not fetched here). */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const [{ data: profiles, error: profileErr }, { data: progress, error: progressErr }] = await Promise.all([
    supabase.from('profiles').select('id, display_name, category'),
    supabase.from('progress').select('user_id, week, exercise_id, amount'),
  ]);
  if (profileErr) throw profileErr;
  if (progressErr) throw progressErr;

  const byUser = new Map<string, Record<string, number>>();
  for (const row of progress ?? []) {
    const logs = byUser.get(row.user_id) ?? {};
    logs[`${row.week}:${row.exercise_id}`] = row.amount;
    byUser.set(row.user_id, logs);
  }

  return (profiles ?? []).map((p) => ({
    userId: p.id,
    state: {
      name: p.display_name || 'Unknown soldier',
      category: (p.category as Category) ?? 'men',
      logs: byUser.get(p.id) ?? {},
      notes: {},
    },
  }));
}
