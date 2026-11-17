import { WEEK_12_TBA, WEEKS, type Week } from '../data/programme';
import type { Week12Details } from '../lib/cloud';
import {
  getDone,
  isWeekComplete,
  logKey,
  weekEnd,
  weekFraction,
  weekStart,
  type DistanceUnit,
  type State,
} from '../lib/progress';
import { ExerciseRow } from './ExerciseRow';

interface Props {
  week: Week;
  state: State;
  currentWeek: number;
  distanceUnit: DistanceUnit;
  week12Details: Week12Details | null;
  update: (fn: (s: State) => State) => void;
}

const fmt = (d: Date) => d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });

export function WeekView({ week, state, currentWeek, distanceUnit, week12Details, update }: Props) {
  const start = weekStart(week.week);
  const end = weekEnd(week.week);
  const pct = Math.round(weekFraction(state, week) * 100);
  const complete = isWeekComplete(state, week);
  const status =
    week.week === currentWeek ? 'ACTIVE MISSION' : week.week < currentWeek ? 'PAST' : 'INCOMING';

  const setDone = (id: string, value: number) =>
    update((s) => ({ ...s, logs: { ...s.logs, [logKey(week.week, id)]: value } }));

  return (
    <section className="week">
      <header className="week-head">
        <div>
          <p className="eyebrow">{status}</p>
          <h2>
            Week {week.week}
            {week.title ? ` — ${week.title}` : ''}
          </h2>
          <p className="meta">
            {fmt(start)} – {fmt(end)}
          </p>
        </div>
        <div className={`pct${complete ? ' on' : ''}`}>{complete ? '★' : `${pct}%`}</div>
      </header>

      {complete && <p className="banner">Mission accomplished. Stand down, soldier.</p>}

      {week.week === WEEKS.length && (
        <div className="tba">
          <p>Intel incoming. Here's what the instructor has revealed so far:</p>
          <ul>
            {WEEK_12_TBA.map((label) => {
              const key = label.toLowerCase() as keyof Week12Details;
              const value = week12Details?.[key]?.trim();
              return (
                <li key={label}>
                  {label}: {value || 'unknown'}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <ul className="exercises">
        {week.exercises.map((ex) => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            done={getDone(state, week.week, ex)}
            category={state.category}
            distanceUnit={distanceUnit}
            onChange={(v) => setDone(ex.id, v)}
          />
        ))}
      </ul>

      <label className="notes">
        <span>Battle log</span>
        <textarea
          rows={3}
          placeholder="Times, how it felt, what hurt…"
          value={state.notes[week.week] ?? ''}
          onChange={(e) => update((s) => ({ ...s, notes: { ...s.notes, [week.week]: e.target.value } }))}
        />
      </label>
    </section>
  );
}
