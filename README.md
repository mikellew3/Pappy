# Pappy & One

A personal **one-and-done** golf pick'em tracker for the 2026 PGA Tour season.
Country-club editorial aesthetic — Masters program meets terminal data tracker.
Private, single-user, installable as a PWA.

> Pick one player per tournament. Use each player only once all season. Track
> finishes, wins, top-10s, and missed cuts.

**Works with zero setup.** Picks save to your browser's `localStorage` — open
the app and start picking. Optional **cross-device sync** can be turned on at
runtime via a tiny Cloudflare Worker (see below); it stays local-first, so the
app is always instant and works offline.

## Stack

- **Vite + React + TypeScript**
- **Tailwind** for layout utilities (the visual design is bespoke CSS)
- **PWA** — manifest, icons, service worker (app shell cached offline)
- **localStorage** for persistence (local-first)
- **Cloudflare Worker + KV** for optional cross-device sync (`worker/`)
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
├── worker/                     # Cloudflare Worker + KV sync endpoint
│   ├── src/index.ts
│   └── wrangler.toml
└── src/
    ├── main.tsx / App.tsx
    ├── context/                # Toast provider
    ├── hooks/usePicks.ts       # local-first picks state + sync reconcile
    ├── data/                   # tournaments, players, seed picks
    ├── lib/                    # types, finish/format helpers, sync client
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

## Cross-device sync (optional)

Sync keeps one shared picks document in **Cloudflare KV**, fronted by a small
Worker and gated by a passphrase you choose. It's **local-first**: every change
saves to `localStorage` instantly and works offline; the Worker just reconciles
devices (last-write-wins by timestamp). There are no user accounts.

### One-time: deploy the Worker

```bash
cd worker
npm install
npx wrangler login

# Create the KV namespace, then paste the returned id into wrangler.toml
npx wrangler kv namespace create PAPPY_KV

# Choose a strong passphrase and set it as the Worker secret
npx wrangler secret put SYNC_SECRET

npx wrangler deploy
```

Deploy prints your Worker URL, e.g. `https://pappy-sync.<you>.workers.dev`.

### Turn it on in the app (per device)

1. Click the **Local only** pill at the top-right → the Cloud Sync panel.
2. Paste the **Worker URL** and the **passphrase** (the `SYNC_SECRET` value).
3. **Save.** The pill turns **Synced**.

Repeat on each device with the same URL + passphrase. The status pill shows
`Synced` / `Syncing…` / `Offline` / `Check passphrase`. Config is stored locally
(keys `pappy-sync-url`, `pappy-sync-key`) — nothing is baked into the build, so
the Vercel deploy stays env-free. (You can optionally pre-fill the URL with a
`VITE_SYNC_URL` build env var.)

The Worker exposes `GET`/`PUT /picks` with `Authorization: Bearer <passphrase>`
and permissive CORS; see `worker/src/index.ts`.

## PWA / Add to Home Screen

The build emits a service worker (via `vite-plugin-pwa`, `autoUpdate`) that
caches the app shell and Google Fonts, so it launches offline. On iOS/Android
use the browser's **Add to Home Screen** to install.

> Regenerate icons after changing the mark: `node scripts/gen-icons.mjs`.

## Deferred (not in this pass)

Multi-user/pools, auto-fetched finishes from a golf API, stats charts, prize
money, and bespoke mobile layouts beyond responsive.
