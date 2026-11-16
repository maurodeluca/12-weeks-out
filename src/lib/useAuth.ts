import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Always redirect to the deployed site, never the current origin. Magic-link emails get opened on
// whatever device is handiest (phone, another computer) - a local dev address like 127.0.0.1 only
// ever means "this exact machine" and silently fails (blank page) from anywhere else.
const APP_URL = 'https://maurodeluca.github.io/12-weeks-out/';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      // Clicking the magic link leaves #access_token=... (or ?code=...) in the address bar;
      // tidy it up once Supabase has parsed it into a session.
      if (event === 'SIGNED_IN' && (window.location.hash || window.location.search)) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    (email: string) =>
      supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: APP_URL },
      }),
    [],
  );

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return { session, loading, signInWithEmail, signOut };
}
