import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Pick } from '../lib/types'

export interface NewPick {
  tournament_name: string
  tournament_date: string | null
  player_name: string
  finish: string | null
}

export type PickPatch = Partial<Omit<Pick, 'id' | 'season_id' | 'user_id' | 'created_at' | 'updated_at'>>

interface UsePicksResult {
  picks: Pick[]
  loading: boolean
  error: string | null
  addPick: (input: NewPick) => Promise<{ error: string | null }>
  updatePick: (id: string, patch: PickPatch) => Promise<{ error: string | null }>
  deletePick: (id: string) => Promise<{ error: string | null }>
  resetSeason: () => Promise<{ error: string | null }>
  refresh: () => Promise<void>
}

// Schedule order: by tournament date (undated last), then creation time.
function sortPicks(rows: Pick[]): Pick[] {
  return [...rows].sort((a, b) => {
    const da = a.tournament_date ?? '9999-12-31'
    const db = b.tournament_date ?? '9999-12-31'
    if (da !== db) return da < db ? -1 : 1
    return a.created_at < b.created_at ? -1 : 1
  })
}

export function usePicks(
  seasonId: string | undefined,
  userId: string | undefined,
): UsePicksResult {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!seasonId) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('picks')
      .select('*')
      .eq('season_id', seasonId)
    if (err) setError(err.message)
    else setPicks(sortPicks((data ?? []) as Pick[]))
    setLoading(false)
  }, [seasonId])

  useEffect(() => {
    if (!seasonId) return
    void refresh()
  }, [seasonId, refresh])

  const addPick = useCallback(
    async (input: NewPick) => {
      if (!seasonId || !userId) return { error: 'No active season.' }
      const { data, error: err } = await supabase
        .from('picks')
        .insert({ ...input, season_id: seasonId, user_id: userId })
        .select()
        .single()
      if (err) return { error: err.message }
      setPicks((prev) => sortPicks([...prev, data as Pick]))
      return { error: null }
    },
    [seasonId, userId],
  )

  const updatePick = useCallback(async (id: string, patch: PickPatch) => {
    const { data, error: err } = await supabase
      .from('picks')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (err) return { error: err.message }
    setPicks((prev) => sortPicks(prev.map((p) => (p.id === id ? (data as Pick) : p))))
    return { error: null }
  }, [])

  const deletePick = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('picks').delete().eq('id', id)
    if (err) return { error: err.message }
    setPicks((prev) => prev.filter((p) => p.id !== id))
    return { error: null }
  }, [])

  const resetSeason = useCallback(async () => {
    if (!seasonId) return { error: 'No active season.' }
    const { error: err } = await supabase.from('picks').delete().eq('season_id', seasonId)
    if (err) return { error: err.message }
    setPicks([])
    return { error: null }
  }, [seasonId])

  return { picks, loading, error, addPick, updatePick, deletePick, resetSeason, refresh }
}
