# 12 Weeks Out ★

Progress tracker for the **Flutter Gym "12 Weeks Out" challenge** (14 Sept – 11 Dec 2026).
Mobile-first, installable (PWA), works offline. Black, gold, stencil type — Rocky training montage meets boot camp.

## Features

- **Mission** – this week's exercises with targets, kit weights (men/women) and incline. Log with +/- steps, type an exact number, or hit **DONE**.
- **Campaign** – all 12 weeks at a glance with progress per week.
- **Rank** – overall progress, rank (Recruit → Champion), week streak, days to go, total distance.
- **Battle log** – notes per week (times, how it felt).
- **Backup** – export / import progress as JSON. Data lives in the browser's `localStorage` only.

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
