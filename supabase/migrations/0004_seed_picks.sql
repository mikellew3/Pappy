-- ===========================================================================
-- Seed: import the 19 existing picks from the prototype as the admin's
--       initial 2026 season.
--
-- Prerequisite: the admin account must already exist in auth.users. Sign in
-- once via magic link (or create the user in the Supabase dashboard) BEFORE
-- running this. Adjust the email below if your admin address differs.
--
-- Safe to re-run: it creates the 2026 season if missing and only seeds picks
-- when that season currently has none.
-- ===========================================================================
do $$
declare
  v_email     text := 'mikellewellynpac@gmail.com';
  v_user_id   uuid;
  v_season_id uuid;
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    raise notice 'No auth user for %, skipping pick seed. Sign in once, then re-run.', v_email;
    return;
  end if;

  -- Find or create the 2026 season for this user.
  select id into v_season_id
  from public.seasons
  where user_id = v_user_id and year = 2026;

  if v_season_id is null then
    insert into public.seasons (year, name, user_id)
    values (2026, '2026 PGA Tour Season', v_user_id)
    returning id into v_season_id;
  end if;

  -- Only seed when the season has no picks yet.
  if exists (select 1 from public.picks where season_id = v_season_id) then
    raise notice 'Season % already has picks, skipping seed.', v_season_id;
    return;
  end if;

  insert into public.picks
    (season_id, user_id, tournament_name, tournament_date, player_name, finish)
  select
    v_season_id, v_user_id, x.tournament, t.start_date, x.player, x.finish
  from (values
    ('Sony Open',                   'Nick Taylor',          'T13'),
    ('American Express',            'Ludvig Aberg',         'WD'),
    ('Farmers Insurance Open',      'S.H. Kim',             'T2'),
    ('WM Phoenix Open',             'Hideki Matsuyama',     'T2'),
    ('AT&T Pebble Beach',           'Tommy Fleetwood',      'T4'),
    ('Genesis Invitational',        'Scottie Scheffler',    'T12'),
    ('Cognizant Classic',           'Aaron Rai',            'T23'),
    ('Arnold Palmer Invitational',  'Collin Morikawa',      '5'),
    ('The Players Championship',    'Jake Knapp',           'MC'),
    ('Valspar Championship',        'Viktor Hovland',       'MC'),
    ('Houston Open',                'Chris Gotterup',       'T6'),
    ('Texas Open',                  'Michael Thorbjornsen', 'MC'),
    ('The Masters',                 'Cameron Young',        'T3'),
    ('RBC Heritage',                'Matt Fitzpatrick',     'WIN'),
    ('Cadillac Championship',       'Sam Burns',            'T38'),
    ('Truist Championship',         'Rory McIlroy',         'T19'),
    ('PGA Championship',            'Xander Schauffele',    'T7'),
    ('CJ Cup Byron Nelson',         'Jordan Spieth',        'T19'),
    ('Charles Schwab Challenge',    'Rickie Fowler',        'MC')
  ) as x(tournament, player, finish)
  left join public.tournaments t
    on t.year = 2026 and t.name = x.tournament;

  raise notice 'Seeded 19 picks into season %.', v_season_id;
end $$;
