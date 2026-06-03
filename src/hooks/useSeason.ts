import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Season } from '../lib/types'

interface SeasonState {
  season: Season | null
  loading: boolean
  error: string | null
}

/**
 * Resolves the current user's season for `year`, creating it on first run.
 * RLS guarantees we only ever touch our own row.
 */
export function useSeason(userId: string | undefined, year = 2026): SeasonState {
  const [season, setSeason] = useState<Season | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let active = true

    async function resolve() {
      setLoading(true)
      setError(null)

      const existing = await supabase
        .from('seasons')
        .select('*')
        .eq('user_id', userId!)
        .eq('year', year)
        .maybeSingle()

      if (!active) return

      if (existing.error) {
        setError(existing.error.message)
        setLoading(false)
        return
      }

      if (existing.data) {
        setSeason(existing.data as Season)
        setLoading(false)
        return
      }

      // None yet — create it.
      const created = await supabase
        .from('seasons')
        .insert({ year, name: `${year} PGA Tour Season`, user_id: userId })
        .select()
        .single()

      if (!active) return

      if (created.error) setError(created.error.message)
      else setSeason(created.data as Season)
      setLoading(false)
    }

    void resolve()
    return () => {
      active = false
    }
  }, [userId, year])

  return { season, loading, error }
}
