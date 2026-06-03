import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Player, Tournament } from '../lib/types'

interface ReferenceData {
  tournaments: Tournament[]
  players: Player[]
  loading: boolean
  error: string | null
}

/**
 * Loads the read-only reference tables (2026 schedule + active roster) once.
 * These power the autocomplete dropdowns.
 */
export function useReferenceData(year = 2026): ReferenceData {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [tRes, pRes] = await Promise.all([
        supabase
          .from('tournaments')
          .select('*')
          .eq('year', year)
          .order('week', { ascending: true }),
        supabase
          .from('players')
          .select('*')
          .eq('active', true)
          .order('name', { ascending: true }),
      ])

      if (!active) return

      if (tRes.error) setError(tRes.error.message)
      else setTournaments(tRes.data as Tournament[])

      if (pRes.error) setError(pRes.error.message)
      else setPlayers(pRes.data as Player[])

      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [year])

  return { tournaments, players, loading, error }
}
