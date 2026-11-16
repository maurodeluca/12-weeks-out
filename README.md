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

The app works fully offline/local with no account. Signing in (magic-link email, from the Rank tab)
additionally syncs progress to Supabase so it follows you across devices and appears on the Squad leaderboard.

**One-time setup** (already done for this repo's project, documented here for reference / if you fork it):

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) once — creates `profiles`, `progress`,
   `notes` tables with row-level security (everyone signed in can read names + progress for the leaderboard;
   each person can only write their own rows; notes stay private).
## Cloud sync & leaderboard (Supabase)

The app works fully offline/local with no account. Signing in (magic-link email, from the Rank tab)
additionally syncs progress to Supabase so it follows you across devices and appears on the Squad leaderboard.

**One-time setup** (already done for this repo's project, documented here for reference / if you fork it):

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) once — creates `profiles`, `progress`,
   `notes` tables with row-level security (everyone signed in can read names + progress for the leaderboard;
   each person can only write their own rows; notes stay private).
3. In **Authentication → URL Configuration**, set the **Site URL** and add every place the app runs to
   **Redirect URLs** — e.g. `http://127.0.0.1:5173/**` for local dev and
   `https://maurodeluca.github.io/12-weeks-out/**` for production. This step is easy to skip but required:
   without a matching entry here, Supabase silently ignores the app's redirect request and sends people to
   its own default (`http://localhost:3000`) instead, which looks like a broken/expired link.
4. Copy **Settings → API → Project URL** and **Publishable key** into [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts).
   The publishable key is safe to commit — it's meant for client-side code; row-level security in `schema.sql`
   is what actually protects data.

> **On a corporate network**, some email security products (Microsoft Defender, Proofpoint, etc.) "click"
> links in incoming email to scan them for phishing, which burns a magic link's single-use token before the
> real recipient opens it — showing `otp_expired`/`access_denied` the moment they click it themselves. This
> isn't an app or Supabase bug; it only shows up on networks with that kind of email scanning. On a normal
> home/personal network it works as expected.

> Free-tier Supabase rate-limits built-in auth emails (a handful per hour). Fine for a company-sized challenge;
> configure custom SMTP in Supabase if you expect a lot of sign-ins at once.

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
