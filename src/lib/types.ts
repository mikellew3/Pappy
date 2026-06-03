// Domain types. Data is stored locally (browser localStorage) — no backend.

export type TournamentTag = 'major' | 'signature' | 'playoff'

export interface Tournament {
  name: string
  week: number
  /** ISO date (YYYY-MM-DD) so picks sort chronologically. */
  start_date: string
  tag?: TournamentTag
}

export interface Pick {
  id: string
  tournament_name: string
  /** ISO date copied from the chosen tournament (null for free-text entries). */
  tournament_date: string | null
  player_name: string
  finish: string | null
}

/** Editable fields on a pick. */
export type PickField = 'tournament_name' | 'tournament_date' | 'player_name' | 'finish'
