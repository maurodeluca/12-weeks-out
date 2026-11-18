import { useEffect, useMemo, useState } from 'react';
import { PROGRAMME_NAME, PROGRAMME_TAGLINE, START_DATE, WEEKS } from './data/programme';
import { Campaign } from './components/Campaign';
import { CoachView } from './components/CoachView';
import { Leaderboard } from './components/Leaderboard';
import { Rank } from './components/Rank';
import { SignInNudge } from './components/SignInNudge';
import { WeekView } from './components/WeekView';
import { fetchWeek12Details, type Week12Details } from './lib/cloud';
import { isCoach } from './lib/coach';
import { clamp, currentWeekNumber } from './lib/progress';
import { useAuth } from './lib/useAuth';
import { useCloudSync } from './lib/useCloudSync';
import { useDistanceUnit } from './lib/useDistanceUnit';
import { useNudges } from './lib/useNudges';
import { useProgress } from './lib/useProgress';

type Tab = 'week' | 'campaign' | 'rank' | 'leaderboard' | 'coach';

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: 'week', label: 'Mission' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'leaderboard', label: 'Squad' },
  { id: 'rank', label: 'Rank' },
];

export default function App() {
  const { state, update, replace } = useProgress();
  const { session, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [distanceUnit, setDistanceUnit] = useDistanceUnit();
  const syncStatus = useCloudSync(session, state, update);
  const { nudges, dismiss: dismissNudge } = useNudges(session);
  const now = useMemo(() => new Date(), []);
  const currentWeek = currentWeekNumber(now);
  const [selected, setSelected] = useState(clamp(currentWeek, 1, WEEKS.length));
  const [tab, setTab] = useState<Tab>('week');
  const [week12Details, setWeek12Details] = useState<Week12Details | null>(null);
  const week = WEEKS[selected - 1];

  useEffect(() => {
    fetchWeek12Details().then(setWeek12Details);
  }, []);

  const start = new Date(`${START_DATE}T00:00:00`);
  const notStarted = currentWeek === 0;
  const showCoachTab = isCoach(session?.user?.email);
  const tabs = showCoachTab ? [...BASE_TABS, { id: 'coach' as const, label: 'Coach' }] : BASE_TABS;

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

      {nudges.map((n) => (
        <div className="coach-nudge" key={n.id}>
          <p>
            <strong>Coach:</strong> {n.message}
          </p>
          <button onClick={() => dismissNudge(n.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}

      <main>
        {tab === 'week' && (
          <>
            {!session && !authLoading && <SignInNudge onGoToRank={() => setTab('rank')} />}
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
            <WeekView
              week={week}
              state={state}
              currentWeek={currentWeek}
              distanceUnit={distanceUnit}
              week12Details={week12Details}
              update={update}
            />
          </>
        )}
        {tab === 'campaign' && (
          <>
            {!session && !authLoading && <SignInNudge onGoToRank={() => setTab('rank')} />}
            <Campaign
              state={state}
              currentWeek={currentWeek}
              selected={selected}
              onSelect={(w) => {
                setSelected(w);
                setTab('week');
              }}
            />
          </>
        )}
        {tab === 'rank' && (
          <Rank
            state={state}
            currentWeek={currentWeek}
            now={now}
            update={update}
            replace={replace}
            session={session}
            authLoading={authLoading}
            signInWithEmail={signInWithEmail}
            signOut={signOut}
            syncStatus={syncStatus}
            distanceUnit={distanceUnit}
            setDistanceUnit={setDistanceUnit}
          />
        )}
        {tab === 'leaderboard' && <Leaderboard session={session} />}
        {tab === 'coach' && session && showCoachTab && <CoachView session={session} />}
      </main>

      <nav className="tabbar" aria-label="Main">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
