import { useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchMyState, pushMyState } from './cloud';
import { mergeState, type State } from './progress';

const PUSH_DEBOUNCE_MS = 800;

/**
 * Pulls + merges cloud state once per sign-in, then pushes local changes to Supabase
 * (debounced) while signed in. No-ops entirely while signed out.
 */
export function useCloudSync(session: Session | null, state: State, update: (fn: (s: State) => State) => void) {
  const mergedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!session) {
      mergedForUser.current = null;
      return;
    }
    if (mergedForUser.current === session.user.id) return;
    let cancelled = false;
    fetchMyState(session.user.id).then((cloud) => {
      if (cancelled) return;
      mergedForUser.current = session.user.id;
      if (cloud) update((s) => mergeState(s, cloud));
    });
    return () => {
      cancelled = true;
    };
  }, [session, update]);

  useEffect(() => {
    if (!session || mergedForUser.current !== session.user.id) return;
    const userId = session.user.id;
    const t = setTimeout(() => {
      pushMyState(userId, state).catch(() => {
        // Offline or a transient error — the next local change will retry.
      });
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [session, state]);
}
