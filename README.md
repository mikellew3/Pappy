# Pappy & One

A personal **one-and-done** golf pick'em tracker for the 2026 PGA Tour season.
Country-club editorial aesthetic — Masters program meets terminal data tracker.
Private, single-user, installable as a PWA.

> Pick one player per tournament. Use each player only once all season. Track
> finishes, wins, top-10s, and missed cuts.

## Stack

- **Vite + React + TypeScript**
- **Supabase** — Postgres, magic-link auth, row-level security
- **Tailwind** for layout utilities (the visual design is bespoke CSS)
- **PWA** — manifest, icons, service worker (app shell cached offline)
- **Vercel** for deployment

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
├── supabase/migrations/        # schema + seed SQL (run in order)
│   ├── 0001_schema.sql
│   ├── 0002_seed_tournaments.sql
│   ├── 0003_seed_players.sql
│   └── 0004_seed_picks.sql
└── src/
    ├── main.tsx / App.tsx
    ├── context/                # Auth + Toast providers
    ├── hooks/                  # reference data, season, picks
    ├── lib/                    # supabase client, types, finish/format helpers
    └── components/             # Masthead, StatStrip, AddPickForm, PicksTable, …
```

## 1. Supabase setup

1. Create a new Supabase project.
2. Open **SQL Editor** and run the migrations **in order**:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_seed_tournaments.sql`
   - `supabase/migrations/0003_seed_players.sql`
3. **Create the admin account** (no public sign-up):
   - **Authentication → Users → Add user** → enter your email
     (`mikellewellynpac@gmail.com`), or sign in once via the app's magic link.
4. Seed the existing 19 picks by running `0004_seed_picks.sql`. It looks up your
   user by email, creates the 2026 season, and imports the picks. Edit the
   `v_email` value at the top if your admin address differs.

RLS is enabled on every table: `picks`/`seasons` are filtered by `auth.uid()`;
`tournaments`/`players` are read-only for authenticated users. Because
`shouldCreateUser` is `false` in the auth flow, only pre-created accounts can
sign in.

## 2. Local development

```bash
cp .env.example .env.local      # fill in your Supabase URL + anon key
npm install
npm run dev
```

`.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Find both under **Supabase → Project Settings → API**.

Useful scripts:

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Vite dev server                      |
| `npm run build`    | Type-check + production build        |
| `npm run preview`  | Preview the production build         |
| `npm run typecheck`| Type-check only                      |
| `node scripts/gen-icons.mjs` | Regenerate PWA icons       |

## 3. Deploy to Vercel

1. Import the repo into Vercel. Framework preset: **Vite** (auto-detected via
   `vercel.json`).
2. Add the env vars under **Settings → Environment Variables** (Production +
   Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In Supabase, add your Vercel URL (and any custom domain, e.g.
   `pappy.gmdhc.com`) under **Authentication → URL Configuration → Site URL /
   Redirect URLs** so magic links return to the app.
4. Deploy.

## PWA / Add to Home Screen

The build emits a service worker (via `vite-plugin-pwa`, `autoUpdate`) that
caches the app shell and Google Fonts for offline launch. Picks read/write
Supabase when online. On iOS/Android use the browser's **Add to Home Screen**
to install; the manifest provides the name, theme color, and icons.

> Regenerate icons after changing the mark: `node scripts/gen-icons.mjs`.

## Data model

| Table         | Purpose                                            |
| ------------- | -------------------------------------------------- |
| `seasons`     | One row per user per year; owns picks.             |
| `picks`       | The user's picks (RLS by `user_id`).               |
| `tournaments` | Read-only 2026 schedule (45 events).               |
| `players`     | Read-only PGA Tour roster (~220 active players).   |

Finish strings are free text. Auto-coloring: `WIN`/`1` → gold, top-10 → green,
`MC`/`WD`/`DQ`/`CUT` → red.

## Deferred (not in this pass)

Multi-user/pools, auto-fetched finishes from a golf API, stats charts, prize
money, and bespoke mobile layouts beyond responsive.
