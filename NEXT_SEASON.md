# Pappy & One — 2027 Improvements

The 2026 season worked, but the rough edges all traced back to one thing:
**there was no backend.** Picks lived only in the browser's localStorage, which
meant they couldn't sync to the phone, couldn't be updated remotely, and got
wiped by cache/reseed edge cases. Fixing that is the whole game for next year.

> Goal, in the user's words: **"an app on my phone that just works."**

## 1. A real backend — the headline fix (do this first)

Everything else depends on it. Options, roughly in order of fit:

- **Supabase** (Postgres + Auth + sync). Ironically this is what the very first
  build used before we stripped it out for simplicity. It's the right call for a
  phone app: magic-link login, row-level security, and picks that persist
  server-side and sync to every device automatically. The original schema +
  migrations are in git history (commit `0c5fbf2^`) and can be restored.
- **Cloudflare Worker + KV** (lighter). The passphrase-gated sync we prototyped
  and removed. Simpler, no login, but less capable.

Outcome: enter a pick on the phone OR have it entered for you → it shows up
everywhere, instantly, and never disappears.

## 2. Installable phone app that doesn't get stuck

- Fix the PWA update story so a new deploy never leaves a stale cached version
  behind (we hit "app frozen on an old build" repeatedly). Add an explicit
  "update available — reload" prompt instead of silent auto-update.
- Verify clean "Add to Home Screen" on iOS, correct icons/splash, offline shell.
- Consider whether a thin native wrapper is worth it, or if a solid PWA suffices.

## 3. Auto-fetch finishes

Pull tournament results from a golf data source so finishes (T13, MC, WIN…)
populate automatically instead of being typed in each week.

## 4. Clean season rollover

One action to start a new season: load the new schedule, archive last year's
picks, reset the board — without hand-editing data files.

## 5. Nice-to-haves

- Pick-deadline reminders / notifications before each event.
- Season summary + stats (wins, top-10 rate, best/worst picks, points/prize).
- Keep the country-club design — that part landed well.

## Lessons from 2026

- **Local-only can't serve "update my picks for me."** The moment picks need to
  reach a phone or be entered remotely, a server is required. Don't relitigate
  this next year — start with the backend.
- Reference data (schedule, roster incl. LIV) and the UI/design are solid and
  can carry forward largely unchanged.
