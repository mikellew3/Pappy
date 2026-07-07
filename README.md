# Pappy & One

A personal **one-and-done** golf pick'em tracker for the 2026 PGA Tour season.
Country-club editorial aesthetic — Masters program meets terminal data tracker.
Private, single-user, installable as a PWA.

> Pick one player per tournament. Use each player only once all season. Track
> finishes, wins, top-10s, and missed cuts.

**Works with zero setup.** You add, edit, and delete picks right in the app and
they **save to your browser instantly** — your picks are authoritative and are
never overwritten. `src/data/seasonPicks.ts` is only a one-time starting
baseline applied the first time the app runs on a device (or after a deliberate
reset). Picks persist per device; there is no cross-device sync.

## Stack

- **Vite + React + TypeScript**
- **Tailwind** for layout utilities (the visual design is bespoke CSS)
- **PWA** — manifest, icons, service worker (app shell cached offline)
- **localStorage** for persistence (your picks are authoritative)
- **Vercel** for deployment (static, zero env vars)

## Project layout

```
.
├── index.html                  # app shell + fonts + PWA meta
├── vite.config.ts              # Vite + vite-plugin-pwa
├── vercel.json                 # SPA rewrites + headers
├── scripts/gen-icons.mjs       # regenerate PWA PNG icons (no deps)
├── public/
│   ├── favicon.svg
│   └── icons/                  # generated PWA icons
└── src/
    ├── main.tsx / App.tsx
    ├── context/                # Toast provider
    ├── hooks/usePicks.ts       # localStorage-persisted picks (baseline seeds once)
    ├── data/                   # tournaments, players, seasonPicks (starting baseline)
    ├── lib/                    # types, finish/format helpers
    └── components/             # Masthead, StatStrip, AddPickForm, PicksTable, …
```

## Develop

```bash
npm install
npm run dev
```

Useful scripts:

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Vite dev server                      |
| `npm run build`    | Type-check + production build        |
| `npm run preview`  | Preview the production build         |
| `npm run typecheck`| Type-check only                      |
| `node scripts/gen-icons.mjs` | Regenerate PWA icons       |

## Deploy to Vercel

1. Import the repo. Framework preset: **Vite** (auto-detected via `vercel.json`).
2. Deploy. That's it — no environment variables.

Point a domain (e.g. `pappy.gmdhc.com`) at the deployment when ready.

## Data

All reference data lives in `src/data/` and is easy to edit by hand:

- `seasonPicks.ts` — the **starting baseline** applied once per device. Not a
  live feed: after the first run, your in-app picks are authoritative.
- `tournaments.ts` — 2026 schedule (45 events) with weeks, ISO dates, and
  major/signature/playoff tags.
- `players.ts` — PGA Tour + LIV roster (~256 names) for the player autocomplete.

Picks are stored under the `localStorage` key `pappy-one-and-done-2026`
(`pappy-baseline-applied` marks that the starting baseline has been seeded). Use
**Export JSON** to back up and **Reset Season** to clear. Finish strings are
free text; auto-coloring: `WIN`/`1` → gold, top-10 → green,
`MC`/`WD`/`DQ`/`CUT` → red.

## Making picks

Just use the app — **Add a Pick**, or click any cell to edit, or DELETE twice to
remove. Every change saves to your browser immediately and sticks. One player
per tournament; each player is usable only once all season (the autocomplete
locks used names).

Picks live on the device where you enter them (no cross-device sync). Use
**Export JSON** to keep a backup.

### Starting fresh

Your saved picks are always the source of truth — no deploy or code change ever
overwrites them. `src/data/seasonPicks.ts` seeds **only** a brand-new browser
(empty storage). To wipe and start over, use **Reset Season** in the app (or
clear the `pappy-one-and-done-2026` localStorage key).

## PWA / Add to Home Screen

The build emits a service worker (via `vite-plugin-pwa`, `autoUpdate`) that
caches the app shell and Google Fonts, so it launches offline. On iOS/Android
use the browser's **Add to Home Screen** to install.

> Regenerate icons after changing the mark: `node scripts/gen-icons.mjs`.

## Deferred (not in this pass)

Multi-user/pools, auto-fetched finishes from a golf API, stats charts, prize
money, and bespoke mobile layouts beyond responsive.
