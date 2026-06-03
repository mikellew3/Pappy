-- ===========================================================================
-- Pappy & One — schema
-- 2026 PGA Tour one-and-done tracker
--
-- Run order: 0001_schema → 0002_seed_tournaments → 0003_seed_players
--            → 0004_seed_picks (after the admin account exists)
--
-- Tables:
--   seasons      one row per user per year (owns picks)
--   picks        the user's one-and-done picks (RLS by user_id)
--   tournaments  read-only 2026 schedule reference
--   players      read-only PGA Tour roster reference
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- seasons
-- --------------------------------------------------------------------------
create table if not exists public.seasons (
  id         uuid primary key default gen_random_uuid(),
  year       integer not null,
  name       text not null,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, year)
);

-- --------------------------------------------------------------------------
-- picks
-- tournament_name / player_name are denormalized text (the autocomplete
-- writes the chosen label) so a pick survives reference-table edits and
-- "finish" stays free text (T12, WIN, MC, …).
-- --------------------------------------------------------------------------
create table if not exists public.picks (
  id              uuid primary key default gen_random_uuid(),
  season_id       uuid not null references public.seasons (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  tournament_name text not null,
  tournament_date date,
  player_name     text not null,
  finish          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists picks_season_idx on public.picks (season_id);
create index if not exists picks_user_idx on public.picks (user_id);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists picks_set_updated_at on public.picks;
create trigger picks_set_updated_at
  before update on public.picks
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- tournaments (read-only reference)
-- --------------------------------------------------------------------------
create table if not exists public.tournaments (
  id         uuid primary key default gen_random_uuid(),
  year       integer not null,
  name       text not null,
  week       integer,
  start_date date,
  tag        text check (tag in ('major', 'signature', 'playoff')),
  unique (year, name)
);

create index if not exists tournaments_year_idx on public.tournaments (year, week);

-- --------------------------------------------------------------------------
-- players (read-only reference)
-- --------------------------------------------------------------------------
create table if not exists public.players (
  id     uuid primary key default gen_random_uuid(),
  name   text not null unique,
  active boolean not null default true
);

create index if not exists players_active_idx on public.players (active);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.seasons     enable row level security;
alter table public.picks       enable row level security;
alter table public.tournaments enable row level security;
alter table public.players     enable row level security;

-- seasons: a user only ever sees / writes their own season rows.
drop policy if exists "seasons_select_own" on public.seasons;
create policy "seasons_select_own" on public.seasons
  for select using (auth.uid() = user_id);

drop policy if exists "seasons_insert_own" on public.seasons;
create policy "seasons_insert_own" on public.seasons
  for insert with check (auth.uid() = user_id);

drop policy if exists "seasons_update_own" on public.seasons;
create policy "seasons_update_own" on public.seasons
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "seasons_delete_own" on public.seasons;
create policy "seasons_delete_own" on public.seasons
  for delete using (auth.uid() = user_id);

-- picks: filtered by auth.uid().
drop policy if exists "picks_select_own" on public.picks;
create policy "picks_select_own" on public.picks
  for select using (auth.uid() = user_id);

drop policy if exists "picks_insert_own" on public.picks;
create policy "picks_insert_own" on public.picks
  for insert with check (auth.uid() = user_id);

drop policy if exists "picks_update_own" on public.picks;
create policy "picks_update_own" on public.picks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "picks_delete_own" on public.picks;
create policy "picks_delete_own" on public.picks
  for delete using (auth.uid() = user_id);

-- tournaments + players: read-only for any authenticated user.
drop policy if exists "tournaments_read" on public.tournaments;
create policy "tournaments_read" on public.tournaments
  for select to authenticated using (true);

drop policy if exists "players_read" on public.players;
create policy "players_read" on public.players
  for select to authenticated using (true);
