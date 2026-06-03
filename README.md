# Pappy & One

A personal **one-and-done** golf pick'em tracker for the 2026 PGA Tour season.
Country-club editorial aesthetic — Masters program meets terminal data tracker.
Private, single-user, installable as a PWA.

> Pick one player per tournament. Use each player only once all season. Track
> finishes, wins, top-10s, and missed cuts.

**Works with zero setup.** The season record lives in a committed data file
(`src/data/seasonPicks.ts`) — that's the source of truth. The app caches it in
`localStorage` for instant/offline use; when the record changes and the app is
redeployed, every device adopts the new picks automatically.

## Stack

- **Vite + React + TypeScript**
- **Tailwind** for layout utilities (the visual design is bespoke CSS)
- **PWA** — manifest, icons, service worker (app shell cached offline)
- **localStorage** cache over a committed picks file (source of truth)
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
    ├── hooks/usePicks.ts       # localStorage cache over the committed record
    ├── data/                   # tournaments, players, seasonPicks (the record)
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

- `seasonPicks.ts` — **the season record** (source of truth). See "Updating the
  picks" above.
- `tournaments.ts` — 2026 schedule (45 events) with weeks, ISO dates, and
  major/signature/playoff tags.
- `players.ts` — PGA Tour roster (~220 names) for the player autocomplete.

The app caches the loaded picks under the `localStorage` key
`pappy-one-and-done-2026` (with `pappy-data-version` tracking which record
version is cached). Use **Export JSON** to back up and **Reset Season** to
clear. Finish strings are free text; auto-coloring: `WIN`/`1` → gold,
top-10 → green, `MC`/`WD`/`DQ`/`CUT` → red.

## Updating the picks (weekly)

The committed record is the source of truth, so updating is a small code edit:

1. Open **`src/data/seasonPicks.ts`**.
2. Add or edit entries in `SEASON_PICKS` (one player per tournament; each player
   used at most once all season). `finish` is free text — `T12`, `WIN`, `MC`,
   `WD`, `5`, … — leave `''` until the event is played.
3. **Bump `DATA_VERSION`** (e.g. to today's date). This is what tells already-open
   browsers to adopt the new record instead of their cached copy.
4. Commit and deploy. Every device shows the update next time it opens.

Tournament dates are filled in automatically from `src/data/tournaments.ts`.

> The in-app Add/Edit/Delete controls still work and persist locally between
> updates — handy for a quick tweak — but a deploy with a new `DATA_VERSION`
> re-adopts the committed record (it wins). Treat `seasonPicks.ts` as the
> book of record. **Export JSON** backs up whatever is currently loaded.

## PWA / Add to Home Screen

The build emits a service worker (via `vite-plugin-pwa`, `autoUpdate`) that
caches the app shell and Google Fonts, so it launches offline. On iOS/Android
use the browser's **Add to Home Screen** to install.

> Regenerate icons after changing the mark: `node scripts/gen-icons.mjs`.

## Deferred (not in this pass)

Multi-user/pools, auto-fetched finishes from a golf API, stats charts, prize
money, and bespoke mobile layouts beyond responsive.
