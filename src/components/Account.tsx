import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session | null;
  authLoading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  verifyCode: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

type Step = 'email' | 'code';

export function Account({ session, authLoading, signInWithEmail, verifyCode, signOut }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'busy') return;
    setStatus('busy');
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('idle');
      setStep('code');
      setCode('');
      setMessage(`We sent a 6-digit code to ${email.trim()}. Enter it below — no link to click.`);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || status === 'busy') return;
    setStatus('busy');
    const { error } = await verifyCode(email.trim(), code.trim());
    if (error) {
      setStatus('error');
      setMessage(error.message);
    }
    // On success, the session updates via onAuthStateChange and this component re-renders signed in.
  };

  const useDifferentEmail = () => {
    setStep('email');
    setCode('');
    setStatus('idle');
    setMessage('');
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

          {step === 'email' && (
            <form onSubmit={sendCode} className="row">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button className="btn" type="submit" disabled={status === 'busy'}>
                {status === 'busy' ? 'Sending…' : 'Send code'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={onVerify} className="row">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                aria-label="6-digit code"
              />
              <button className="btn" type="submit" disabled={status === 'busy'}>
                {status === 'busy' ? 'Verifying…' : 'Verify'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <div className="row">
              <button className="btn" type="button" onClick={sendCode} disabled={status === 'busy'}>
                Resend code
              </button>
              <button className="btn" type="button" onClick={useDifferentEmail}>
                Use a different email
              </button>
            </div>
          )}

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
