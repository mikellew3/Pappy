// ===========================================================================
// STARTING PICKS — used to seed ONLY a brand-new browser (empty storage).
//
// The app saves your picks locally the moment you enter them, and your saved
// picks are always the source of truth. This list is never re-applied to a
// browser that already has data — no deploy or code change can overwrite your
// picks. To wipe and start over, use "Reset Season" in the app.
//
// tournament_date is resolved automatically from TOURNAMENTS (src/data).
// finish is free text: T12, WIN, MC, WD, 5, etc. Leave '' if not played yet.
// ===========================================================================

export interface SeasonPick {
  tournament_name: string
  player_name: string
  finish: string
}

export const SEASON_PICKS: SeasonPick[] = [
  { tournament_name: 'Sony Open', player_name: 'Nick Taylor', finish: 'T13' },
  { tournament_name: 'American Express', player_name: 'Ludvig Aberg', finish: 'WD' },
  { tournament_name: 'Farmers Insurance Open', player_name: 'S.H. Kim', finish: 'T2' },
  { tournament_name: 'WM Phoenix Open', player_name: 'Hideki Matsuyama', finish: 'T2' },
  { tournament_name: 'AT&T Pebble Beach', player_name: 'Tommy Fleetwood', finish: 'T4' },
  { tournament_name: 'Genesis Invitational', player_name: 'Scottie Scheffler', finish: 'T12' },
  { tournament_name: 'Cognizant Classic', player_name: 'Aaron Rai', finish: 'T23' },
  { tournament_name: 'Arnold Palmer Invitational', player_name: 'Collin Morikawa', finish: '5' },
  { tournament_name: 'The Players Championship', player_name: 'Jake Knapp', finish: 'MC' },
  { tournament_name: 'Valspar Championship', player_name: 'Viktor Hovland', finish: 'MC' },
  { tournament_name: 'Houston Open', player_name: 'Chris Gotterup', finish: 'T6' },
  { tournament_name: 'Texas Open', player_name: 'Michael Thorbjornsen', finish: 'MC' },
  { tournament_name: 'The Masters', player_name: 'Cameron Young', finish: 'T3' },
  { tournament_name: 'RBC Heritage', player_name: 'Matt Fitzpatrick', finish: 'WIN' },
  { tournament_name: 'Cadillac Championship', player_name: 'Sam Burns', finish: 'T38' },
  { tournament_name: 'Truist Championship', player_name: 'Rory McIlroy', finish: 'T19' },
  { tournament_name: 'PGA Championship', player_name: 'Xander Schauffele', finish: 'T7' },
  { tournament_name: 'CJ Cup Byron Nelson', player_name: 'Jordan Spieth', finish: 'T19' },
  { tournament_name: 'Charles Schwab Challenge', player_name: 'Rickie Fowler', finish: 'MC' },
  { tournament_name: 'Memorial Tournament', player_name: 'Ben Griffin', finish: 'MC' },
  { tournament_name: 'RBC Canadian Open', player_name: 'Brooks Koepka', finish: '' },
  { tournament_name: 'U.S. Open', player_name: 'Patrick Reed', finish: 'MC' },
  { tournament_name: 'Travelers Championship', player_name: 'Russell Henley', finish: '' },
  { tournament_name: 'Genesis Scottish Open', player_name: 'Alex Fitzpatrick', finish: '' },
  { tournament_name: 'The Open Championship', player_name: 'Tyrrell Hatton', finish: '' },
]
