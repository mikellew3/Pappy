// The 19 existing picks, used to seed a fresh browser on first run.
// (tournament_date is resolved from TOURNAMENTS when seeding — see usePicks.)
export interface SeedPick {
  tournament_name: string
  player_name: string
  finish: string
}

export const SEED_PICKS: SeedPick[] = [
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
]
