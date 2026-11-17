import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { WEEKS } from '../data/programme';
import {
  errorMessage,
  fetchLeaderboard,
  fetchWeek12Details,
  upsertWeek12Details,
  type LeaderboardEntry,
  type Week12Details,
} from '../lib/cloud';
import { formatRelative } from '../lib/format';
import { completedWeeks, overallFraction, rankFor } from '../lib/progress';

interface Props {
  session: Session;
}

type SortField = 'name' | 'category' | 'rank' | 'weeks' | 'active';

const EMPTY_DETAILS: Week12Details = { location: '', weight: '', distance: '', gradient: '' };
const WEEK12_FIELDS = ['location', 'weight', 'distance', 'gradient'] as const;

export function CoachView({ session }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<{ field: SortField; dir: 1 | -1 }>({ field: 'rank', dir: -1 });

  const [details, setDetails] = useState<Week12Details>(EMPTY_DETAILS);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard()
      .then((rows) => {
        if (!cancelled) setEntries(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e, 'Could not load participants.'));
      });
    fetchWeek12Details().then((d) => {
      if (!cancelled && d) setDetails(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const withStats = (entries ?? []).map((e) => {
      const fraction = overallFraction(e.state);
      return { ...e, fraction, weeks: completedWeeks(e.state), rankName: rankFor(fraction).name };
    });
    const { field, dir } = sort;
    return withStats.sort((a, b) => {
      switch (field) {
        case 'name':
          return dir * a.state.name.localeCompare(b.state.name);
        case 'category':
          return dir * a.state.category.localeCompare(b.state.category);
        case 'weeks':
          return dir * (a.weeks - b.weeks);
        case 'active':
          return dir * (a.lastActive ?? '').localeCompare(b.lastActive ?? '');
        case 'rank':
        default:
          return dir * (a.fraction - b.fraction);
      }
    });
  }, [entries, sort]);

  const toggleSort = (field: SortField) =>
    setSort((s) => (s.field === field ? { field, dir: s.dir === 1 ? -1 : 1 } : { field, dir: -1 }));

  const onSaveWeek12 = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await upsertWeek12Details(details);
      setSaveMessage('Saved — everyone sees this on Week 12 now.');
    } catch (e) {
      setSaveMessage(errorMessage(e, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 className="section-title">Coach</h2>

      <div className="card">
        <h3>Reveal Week 12 — The Long Walk</h3>
        <p className="meta">
          Fill in whatever's been announced so far — blank fields still show "unknown" to participants.
        </p>
        {WEEK12_FIELDS.map((field) => (
          <label className="field" key={field}>
            <span>{field[0].toUpperCase() + field.slice(1)}</span>
            <input
              type="text"
              value={details[field]}
              onChange={(e) => setDetails((d) => ({ ...d, [field]: e.target.value }))}
            />
          </label>
        ))}
        <div className="row">
          <button className="btn" onClick={onSaveWeek12} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {saveMessage && (
          <p className="message" role="status">
            {saveMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h3>Participants</h3>
        {error && <p className="message">{error}</p>}
        {!error && entries === null && <p className="meta">Loading…</p>}
        {!error && entries !== null && rows.length === 0 && <p className="meta">Nobody has signed in yet.</p>}
        {rows.length > 0 && (
          <div className="coach-table-wrap">
            <table className="coach-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')}>Name</th>
                  <th onClick={() => toggleSort('category')}>Kit</th>
                  <th onClick={() => toggleSort('rank')}>Rank</th>
                  <th onClick={() => toggleSort('rank')}>%</th>
                  <th onClick={() => toggleSort('weeks')}>Weeks</th>
                  <th onClick={() => toggleSort('active')}>Last active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className={r.userId === session.user.id ? 'mine' : ''}>
                    <td>{r.state.name || 'Unknown soldier'}</td>
                    <td>{r.state.category}</td>
                    <td>{r.rankName}</td>
                    <td>{Math.round(r.fraction * 100)}%</td>
                    <td>
                      {r.weeks}/{WEEKS.length}
                    </td>
                    <td>{formatRelative(r.lastActive)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
