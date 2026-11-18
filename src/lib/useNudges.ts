import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchUnreadNudges, markNudgeRead, type Nudge } from './cloud';

/** Fetches this user's unread coach nudges once per sign-in, with a local dismiss that acks them. */
export function useNudges(session: Session | null) {
  const [nudges, setNudges] = useState<Nudge[]>([]);

  useEffect(() => {
    if (!session) {
      setNudges([]);
      return;
    }
    let cancelled = false;
    fetchUnreadNudges(session.user.id)
      .then((rows) => {
        if (!cancelled) setNudges(rows);
      })
      .catch(() => {
        // Offline or a transient error - nudges aren't critical, just skip silently.
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const dismiss = (id: number) => {
    setNudges((n) => n.filter((x) => x.id !== id));
    markNudgeRead(id).catch(() => {});
  };

  return { nudges, dismiss };
}
