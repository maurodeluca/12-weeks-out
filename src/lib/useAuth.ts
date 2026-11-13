import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    (email: string) =>
      // No emailRedirectTo: we verify with a typed 6-digit code (see verifyCode), not a clickable
      // link. That sidesteps corporate email scanners pre-fetching the link and burning the token,
      // and avoids depending on Supabase's redirect-URL allow-list being configured correctly.
      supabase.auth.signInWithOtp({ email }),
    [],
  );

  const verifyCode = useCallback(
    (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: 'email' }),
    [],
  );

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return { session, loading, signInWithEmail, verifyCode, signOut };
}
