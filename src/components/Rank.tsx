import { useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { END_DATE, WEEKS } from '../data/programme';
import { wipeMyCloudState } from '../lib/cloud';
import {
  completedWeeks,
  exportState,
  formatAmount,
  formatDistance,
  importState,
  initialState,
  overallFraction,
  rankFor,
  RANKS,
  streak,
  totals,
  type Category,
  type DistanceUnit,
  type State,
} from '../lib/progress';
import { Account } from './Account';

interface Props {
  state: State;
  currentWeek: number;
  now: Date;
  update: (fn: (s: State) => State) => void;
  replace: (s: State) => void;
  session: Session | null;
  authLoading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
}

function daysToGo(now: Date): number {
  const [y, m, d] = END_DATE.split('-').map(Number);
  const end = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function Rank({
  state,
  currentWeek,
  now,
  update,
  replace,
  session,
  authLoading,
  signInWithEmail,
  signOut,
  distanceUnit,
  setDistanceUnit,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const fraction = overallFraction(state);
  const rank = rankFor(fraction);
  const t = totals(state);
  const days = daysToGo(now);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      replace(importState(await file.text()));
      setMessage('Progress restored.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not read that file.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const onExport = () => {
    const url = URL.createObjectURL(new Blob([exportState(state)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = '12-weeks-out-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onReset = () => {
    if (window.confirm('Wipe ALL progress? This cannot be undone.')) {
      replace({ ...initialState, name: state.name, category: state.category });
      if (session) wipeMyCloudState(session.user.id).catch(() => {});
      setMessage('Progress wiped. Fresh start.');
    }
  };

  return (
    <section className="rank">
      <h2 className="section-title">Service Record</h2>

      <div className="card hero">
        <p className="eyebrow">{state.name ? state.name.toUpperCase() : 'UNKNOWN SOLDIER'}</p>
        <p className="rank-name">{rank.name}</p>
        <p className="meta">{rank.blurb}</p>
        <div className="bar big" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fraction * 100)}>
          <span style={{ width: `${fraction * 100}%` }} />
        </div>
        <p className="big-pct">{Math.round(fraction * 100)}% complete</p>
      </div>

      <div className="stats">
        <div className="card">
          <strong>{completedWeeks(state)}/{WEEKS.length}</strong>
          <span>Weeks done</span>
        </div>
        <div className="card">
          <strong>{streak(state, currentWeek)}</strong>
          <span>Week streak</span>
        </div>
        <div className="card">
          <strong>{days > 0 ? days : 0}</strong>
          <span>Days to go</span>
        </div>
      </div>

      <div className="card">
        <h3>Distance covered</h3>
        <p className="totals">
          {formatDistance(t.mi ?? 0, distanceUnit)} · {formatAmount(t.m ?? 0, 'm')} · {formatAmount(t.reps ?? 0, 'reps')} reps
        </p>
      </div>

      <Account session={session} authLoading={authLoading} signInWithEmail={signInWithEmail} signOut={signOut} />

      <div className="card">
        <h3>Chain of command</h3>
        <ol className="ranks">
          {RANKS.map((r) => (
            <li key={r.name} className={r.name === rank.name ? 'current' : fraction >= r.min ? 'earned' : ''}>
              {r.name} <span>{Math.round(r.min * 100)}%</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h3>Your profile</h3>
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={state.name}
            maxLength={40}
            placeholder="Your name"
            onChange={(e) => update((s) => ({ ...s, name: e.target.value }))}
          />
        </label>
        <div className="field">
          <span>Kit weights</span>
          <div className="seg" role="radiogroup" aria-label="Kit weights">
            {(['men', 'women'] as Category[]).map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={state.category === c}
                className={state.category === c ? 'on' : ''}
                onClick={() => update((s) => ({ ...s, category: c }))}
              >
                {c === 'men' ? 'Men' : 'Women'}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Distance unit</span>
          <div className="seg" role="radiogroup" aria-label="Distance unit">
            {(['mi', 'km'] as DistanceUnit[]).map((u) => (
              <button
                key={u}
                role="radio"
                aria-checked={distanceUnit === u}
                className={distanceUnit === u ? 'on' : ''}
                onClick={() => setDistanceUnit(u)}
              >
                {u === 'mi' ? 'Miles' : 'Km'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Backup</h3>
        <p className="meta">Progress is stored on this device only. Export it to keep a copy or move phones.</p>
        <div className="row">
          <button className="btn" onClick={onExport}>Export</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import</button>
          <button className="btn danger" onClick={onReset}>Reset</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => onImport(e.target.files?.[0])}
        />
        {message && <p className="message" role="status">{message}</p>}
      </div>
    </section>
  );
}
