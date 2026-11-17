const COACH_EMAILS = ['maurodeluca@live.ie'];

/** Client-side gate for showing coach-only UI. The real enforcement is the RLS policy in
 * supabase/schema.sql, which checks the same emails against the signed-in JWT. */
export function isCoach(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return COACH_EMAILS.some((e) => e.toLowerCase() === lower);
}
