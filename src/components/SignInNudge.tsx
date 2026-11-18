import { useState } from 'react';

const DISMISS_KEY = '12-weeks-out:signin-nudge-dismissed';

interface Props {
  onGoToRank: () => void;
}

/** Shown on Mission/Campaign when signed out, pointing to Rank to sign in. Dismiss persists locally. */
export function SignInNudge({ onGoToRank }: Props) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="nudge">
      <p>Sign in to sync your progress across devices and join the Squad leaderboard.</p>
      <div className="row">
        <button className="btn" onClick={onGoToRank}>
          Sign in
        </button>
        <button className="btn" onClick={dismiss} aria-label="Dismiss">
          Dismiss
        </button>
      </div>
    </div>
  );
}
