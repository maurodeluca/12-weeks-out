import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session | null;
  authLoading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

export function Account({ session, authLoading, signInWithEmail, signOut }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
      setMessage(`Check ${email.trim()} for a sign-in link.`);
    }
  };

  if (authLoading) return null;

  return (
    <div className="card">
      <h3>Squad sync</h3>
      {session ? (
        <>
          <p className="meta">
            Signed in as <strong className="who">{session.user.email}</strong>. Your progress syncs across
            devices and counts on the leaderboard.
          </p>
          <div className="row">
            <button className="btn" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="meta">
            Sign in with your email to sync progress across devices and join the company leaderboard.
            Your device keeps working offline either way.
          </p>
          <form onSubmit={onSubmit} className="row">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button className="btn" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send link'}
            </button>
          </form>
          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
