import { useMemo, useState } from 'react';
import { PROGRAMME_NAME, PROGRAMME_TAGLINE, START_DATE, WEEKS } from './data/programme';
import { Campaign } from './components/Campaign';
import { Rank } from './components/Rank';
import { WeekView } from './components/WeekView';
import { clamp, currentWeekNumber } from './lib/progress';
import { useProgress } from './lib/useProgress';

type Tab = 'week' | 'campaign' | 'rank';

const TABS: { id: Tab; label: string }[] = [
  { id: 'week', label: 'Mission' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'rank', label: 'Rank' },
];

export default function App() {
  const { state, update, replace } = useProgress();
  const now = useMemo(() => new Date(), []);
  const currentWeek = currentWeekNumber(now);
  const [selected, setSelected] = useState(clamp(currentWeek, 1, WEEKS.length));
  const [tab, setTab] = useState<Tab>('week');
  const week = WEEKS[selected - 1];

  const start = new Date(`${START_DATE}T00:00:00`);
  const notStarted = currentWeek === 0;

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">{PROGRAMME_NAME}</p>
        <h1>{PROGRAMME_TAGLINE}</h1>
        <p className="tagline">No excuses. Go the distance.</p>
      </header>

      {notStarted && (
        <p className="banner">
          Boots on {start.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })}. Get ready.
        </p>
      )}
      {currentWeek > WEEKS.length && <p className="banner">The programme is over. Wear your rank with pride.</p>}

      <main>
        {tab === 'week' && (
          <>
            <nav className="week-nav" aria-label="Choose week">
              <button onClick={() => setSelected((s) => Math.max(1, s - 1))} disabled={selected === 1} aria-label="Previous week">
                ‹
              </button>
              <span>
                Week {selected} of {WEEKS.length}
              </span>
              <button
                onClick={() => setSelected((s) => Math.min(WEEKS.length, s + 1))}
                disabled={selected === WEEKS.length}
                aria-label="Next week"
              >
                ›
              </button>
            </nav>
            <WeekView week={week} state={state} currentWeek={currentWeek} update={update} />
          </>
        )}
        {tab === 'campaign' && (
          <Campaign
            state={state}
            currentWeek={currentWeek}
            selected={selected}
            onSelect={(w) => {
              setSelected(w);
              setTab('week');
            }}
          />
        )}
        {tab === 'rank' && <Rank state={state} currentWeek={currentWeek} now={now} update={update} replace={replace} />}
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
