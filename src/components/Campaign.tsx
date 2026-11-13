import { WEEKS } from '../data/programme';
import { isWeekComplete, weekFraction, weekStart, type State } from '../lib/progress';

interface Props {
  state: State;
  currentWeek: number;
  selected: number;
  onSelect: (week: number) => void;
}

export function Campaign({ state, currentWeek, selected, onSelect }: Props) {
  return (
    <section>
      <h2 className="section-title">The Campaign</h2>
      <div className="grid">
        {WEEKS.map((w) => {
          const pct = Math.round(weekFraction(state, w) * 100);
          const complete = isWeekComplete(state, w);
          const cls = [
            'tile',
            complete ? 'complete' : '',
            w.week === currentWeek ? 'current' : '',
            w.week === selected ? 'selected' : '',
          ].join(' ');
          return (
            <button key={w.week} className={cls} onClick={() => onSelect(w.week)}>
              <span className="tile-num">{w.week}</span>
              <span className="tile-date">
                {weekStart(w.week).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
              </span>
              <span className="tile-pct">{complete ? '★' : `${pct}%`}</span>
              <span className="bar small">
                <span style={{ width: `${pct}%` }} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
