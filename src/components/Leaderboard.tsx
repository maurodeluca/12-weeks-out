import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchLeaderboard, type LeaderboardEntry } from '../lib/cloud';
import { formatRelative, medalFor } from '../lib/format';
import { completedWeeks, overallFraction, rankFor, type Category } from '../lib/progress';

interface Props {
  session: Session | null;
}

type CategoryFilter = 'all' | Category;

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
];

export function Leaderboard({ session }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchLeaderboard()
      .then((rows) => {
        if (!cancelled) setEntries(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the leaderboard.');
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) {
    return (
      <section>
        <h2 className="section-title">Leaderboard</h2>
        <p className="meta">Sign in from the Rank tab to see how the whole squad is doing.</p>
      </section>
    );
  }

  const ranked = (entries ?? [])
    .filter((e) => filter === 'all' || e.state.category === filter)
    .map((e) => ({ ...e, fraction: overallFraction(e.state) }))
    .sort((a, b) => b.fraction - a.fraction);

  return (
    <section>
      <h2 className="section-title">Leaderboard</h2>

      <div className="seg" role="radiogroup" aria-label="Filter by kit weight">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={filter === f.id}
            className={filter === f.id ? 'on' : ''}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="message">{error}</p>}
      {!error && entries === null && <p className="meta">Loading…</p>}
      {!error && entries !== null && ranked.length === 0 && <p className="meta">Nobody has logged progress yet.</p>}
      <ol className="leaderboard">
        {ranked.map((e, i) => {
          const mine = e.userId === session.user.id;
          return (
            <li key={e.userId} className={mine ? 'mine' : ''}>
              <span className="pos">{medalFor(i + 1)}</span>
              <span className="who">
                {e.state.name}
                {mine ? ' (you)' : ''}
              </span>
              <span className="rank-tag">{rankFor(e.fraction).name}</span>
              <span className="lb-pct">{Math.round(e.fraction * 100)}%</span>
              <span className="lb-weeks">{completedWeeks(e.state)}/12</span>
              <span className="lb-active">{formatRelative(e.lastActive)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
