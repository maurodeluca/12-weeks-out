import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchMyState, pushMyState } from './cloud';
import { mergeState, type State } from './progress';

const PUSH_DEBOUNCE_MS = 800;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

/**
 * Pulls + merges cloud state once per sign-in, then pushes local changes to Supabase
 * (debounced) while signed in. No-ops entirely while signed out.
 */
export function useCloudSync(session: Session | null, state: State, update: (fn: (s: State) => State) => void) {
  const mergedForUser = useRef<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    if (!session) {
      mergedForUser.current = null;
      setStatus('idle');
      return;
    }
    if (mergedForUser.current === session.user.id) return;
    let cancelled = false;
    setStatus('syncing');
    fetchMyState(session.user.id)
      .then((cloud) => {
        if (cancelled) return;
        mergedForUser.current = session.user.id;
        if (cloud) update((s) => mergeState(s, cloud));
        setStatus('synced');
      })
      .catch(() => {
        if (!cancelled) setStatus(navigator.onLine ? 'error' : 'offline');
      });
    return () => {
      cancelled = true;
    };
  }, [session, update]);

  useEffect(() => {
    if (!session || mergedForUser.current !== session.user.id) return;
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }
    const userId = session.user.id;
    setStatus('syncing');
    const t = setTimeout(() => {
      pushMyState(userId, state)
        .then(() => setStatus('synced'))
        .catch(() => {
          // Offline or a transient error — the next local change (or reconnect) will retry.
          setStatus(navigator.onLine ? 'error' : 'offline');
        });
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [session, state]);

  useEffect(() => {
    if (!session) return;
    const onOnline = () => setStatus((s) => (s === 'offline' ? 'synced' : s));
    const onOffline = () => setStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [session]);

  return status;
}
