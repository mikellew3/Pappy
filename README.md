# Pappy & One

A personal **one-and-done** golf pick'em tracker for the 2026 PGA Tour season.
Country-club editorial aesthetic — Masters program meets terminal data tracker.
Private, single-user, installable as a PWA.

> Pick one player per tournament. Use each player only once all season. Track
> finishes, wins, top-10s, and missed cuts.

**No backend, no accounts, no setup.** Picks are saved to your browser's
`localStorage`. Open the app and start picking.

## Stack

- **Vite + React + TypeScript**
- **Tailwind** for layout utilities (the visual design is bespoke CSS)
- **PWA** — manifest, icons, service worker (app shell cached offline)
- **localStorage** for persistence
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
    ├── hooks/usePicks.ts       # localStorage-backed picks state
    ├── data/                   # tournaments, players, seed picks
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

- `tournaments.ts` — 2026 schedule (45 events) with weeks, ISO dates, and
  major/signature/playoff tags.
- `players.ts` — PGA Tour roster (~220 names) for the player autocomplete.
- `seedPicks.ts` — the 19 existing picks, loaded the first time the app runs in
  a fresh browser.

Picks are stored under the `localStorage` key `pappy-one-and-done-2026`. Use
**Export JSON** to back them up and **Reset Season** to clear. Finish strings
are free text; auto-coloring: `WIN`/`1` → gold, top-10 → green,
`MC`/`WD`/`DQ`/`CUT` → red.

## PWA / Add to Home Screen

The build emits a service worker (via `vite-plugin-pwa`, `autoUpdate`) that
caches the app shell and Google Fonts, so it launches offline. On iOS/Android
use the browser's **Add to Home Screen** to install.

> Regenerate icons after changing the mark: `node scripts/gen-icons.mjs`.

## Deferred (not in this pass)

Multi-user/pools, cloud sync, auto-fetched finishes from a golf API, stats
charts, prize money, and bespoke mobile layouts beyond responsive.
