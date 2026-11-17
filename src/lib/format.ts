const DAY_MS = 86_400_000;

/** Formats an ISO timestamp as "today", "yesterday", "N days ago", or a plain date further back. */
export function formatRelative(iso: string | null, now = new Date()): string {
  if (!iso) return 'never';
  const then = new Date(iso);
  const days = Math.floor((startOfDay(now).getTime() - startOfDay(then).getTime()) / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  return then.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Medal for a 1-based leaderboard position, or the plain number past 3rd place. */
export function medalFor(position: number): string {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return String(position);
}
