// Domain types — mirror the Supabase schema (see supabase/migrations).

export type TournamentTag = 'major' | 'signature' | 'playoff'

export interface Season {
  id: string
  year: number
  name: string
  user_id: string
  created_at: string
}

export interface Pick {
  id: string
  season_id: string
  user_id: string
  tournament_name: string
  tournament_date: string | null
  player_name: string
  finish: string | null
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  year: number
  name: string
  week: number | null
  start_date: string | null
  tag: TournamentTag | null
}

export interface Player {
  id: string
  name: string
  active: boolean
}

/** Editable fields on a pick (everything the UI can write). */
export type PickField = 'tournament_name' | 'tournament_date' | 'player_name' | 'finish'
