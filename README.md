# 12 Weeks Out ★

Progress tracker for the **Flutter Gym "12 Weeks Out" challenge** (14 Sept – 11 Dec 2026).
Mobile-first, installable (PWA), works offline. Black, gold, stencil type — Rocky training montage meets boot camp.

## Inspiration

Built from the instructor's own challenge sheet and poster — the 12-week schedule, exercises and targets
all come straight from these:

<p>
  <img src="docs/inspiration/12-weeks-out-poster.jpeg" alt="Flutter Dublin 12 Weeks Out poster" width="45%" />
  <img src="docs/inspiration/flutter-gym-programme.jpeg" alt="Flutter Gym Programme sheet with the week-by-week exercises" width="45%" />
</p>

## Features

- **Mission** – this week's exercises with targets, kit weights (men/women) and incline. Log with +/- steps, type an exact number, or hit **DONE**.
- **Campaign** – all 12 weeks at a glance with progress per week.
- **Squad** – company leaderboard (requires signing in; see Cloud sync below).
- **Rank** – overall progress, rank (Recruit → Champion), week streak, days to go, total distance.
- **Battle log** – notes per week (times, how it felt).
- **Backup** – export / import progress as JSON. Data lives in the browser's `localStorage` by default, and also syncs to Supabase if signed in.

## Cloud sync & leaderboard (Supabase)

The app works fully offline/local with no account. Signing in (email + 6-digit code, from the Rank tab)
additionally syncs progress to Supabase so it follows you across devices and appears on the Squad leaderboard.

Sign-in uses a **typed 6-digit code**, not a clickable magic link. This is deliberate: on a corporate network,
email security scanners (Microsoft Defender, Proofpoint, etc.) often "click" links in incoming email to check
them for phishing, which burns a magic link's single-use token before the real user opens it — causing an
`otp_expired` / `access_denied` error the moment they click it themselves. A typed code has nothing for a
scanner to click, so it isn't affected.

**One-time setup** (already done for this repo's project, documented here for reference / if you fork it):

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) once — creates `profiles`, `progress`,
   `notes` tables with row-level security (everyone signed in can read names + progress for the leaderboard;
   each person can only write their own rows; notes stay private).
3. In **Authentication → Email Templates**, add `{{ .Token }}` to the body of **both**:
   - **Magic Link** — used when an already-registered email signs in again
   - **Confirm signup** — used the *first* time an email signs in (Supabase creates the account and sends a
     "confirm your email" link by default). Easy to miss since it's a separate template from Magic Link, but
     anyone signing in for the first time will get this one, not Magic Link — forgetting it is why the email
     still shows a "verify email" link instead of a code.

   Supabase's default templates only render a clickable link, so without this edit on both templates the
   6-digit code never appears in the email.
4. (Optional, defense-in-depth) In **Authentication → URL Configuration**, set Redirect URLs for every place
   the app runs, in case anyone clicks the link instead of typing the code.
5. Copy **Settings → API → Project URL** and **Publishable key** into [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts).
   The publishable key is safe to commit — it's meant for client-side code; row-level security in `schema.sql`
   is what actually protects data.

> Free-tier Supabase rate-limits built-in auth emails (a handful per hour). If you see "email rate limit
> exceeded", wait ~an hour before retrying, or configure custom SMTP in Supabase for heavier use.

## Develop

```sh
npm install
npm run dev        # local dev server
npm test           # unit tests (vitest)
npm run build      # typecheck + production build into dist/
```

> Behind a corporate TLS proxy (e.g. Zscaler) and `npm install` fails with a certificate error? Run it with `NODE_USE_SYSTEM_CA=1`.

## Updating the programme

All challenge data lives in [`src/data/programme.ts`](src/data/programme.ts). When the instructor reveals
**Week 12 – The Long Walk** (location, weight, distance, gradient), update the `WEEKS` entry and `WEEK_12_TBA` there.
Progress is keyed by week + exercise `id`, so keep ids stable to avoid losing people's logs.

Notes on the data: "inc 6 / inc 8" on ruck sessions is shown as the incline from the original sheet.
The programme runs from Monday 14 Sept; week 12 runs through 11 Dec.

## Deploy

Pushes to `main` build and publish to GitHub Pages via `.github/workflows/deploy.yml`.
