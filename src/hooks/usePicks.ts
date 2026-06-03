import { useCallback, useEffect, useState } from 'react'
import type { Pick } from '../lib/types'
import { TOURNAMENTS } from '../data/tournaments'
import { SEED_PICKS } from '../data/seedPicks'

export interface NewPick {
  tournament_name: string
  tournament_date: string | null
  player_name: string
  finish: string | null
}

export type PickPatch = Partial<Omit<Pick, 'id'>>

interface UsePicksResult {
  picks: Pick[]
  loading: boolean
  addPick: (input: NewPick) => Promise<{ error: string | null }>
  updatePick: (id: string, patch: PickPatch) => Promise<{ error: string | null }>
  deletePick: (id: string) => Promise<{ error: string | null }>
  resetSeason: () => Promise<{ error: string | null }>
}

const STORAGE_KEY = 'pappy-one-and-done-2026'

const dateByName = new Map(TOURNAMENTS.map((t) => [t.name.toLowerCase(), t.start_date]))

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// Schedule order: by tournament date (undated last), then insertion order.
function sortPicks(rows: Pick[]): Pick[] {
  return rows
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const da = a.p.tournament_date ?? '9999-12-31'
      const db = b.p.tournament_date ?? '9999-12-31'
      if (da !== db) return da < db ? -1 : 1
      return a.i - b.i
    })
    .map((x) => x.p)
}

function seedPicks(): Pick[] {
  return SEED_PICKS.map((s) => ({
    id: newId(),
    tournament_name: s.tournament_name,
    tournament_date: dateByName.get(s.tournament_name.toLowerCase()) ?? null,
    player_name: s.player_name,
    finish: s.finish || null,
  }))
}

function load(): Pick[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Pick[]
  } catch {
    /* fall through to seed */
  }
  const seeded = seedPicks()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  } catch {
    /* ignore quota / private-mode errors */
  }
  return seeded
}

/**
 * Picks state, persisted to localStorage. The async signatures keep the call
 * sites unchanged and leave room for a future networked backend.
 */
export function usePicks(): UsePicksResult {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPicks(sortPicks(load()))
    setLoading(false)
  }, [])

  const persist = useCallback((next: Pick[]) => {
    const sorted = sortPicks(next)
    setPicks(sorted)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
    } catch {
      return 'Save failed'
    }
    return null
  }, [])

  const addPick = useCallback(
    async (input: NewPick) => {
      const error = persist([...picks, { id: newId(), ...input }])
      return { error }
    },
    [picks, persist],
  )

  const updatePick = useCallback(
    async (id: string, patch: PickPatch) => {
      const error = persist(picks.map((p) => (p.id === id ? { ...p, ...patch } : p)))
      return { error }
    },
    [picks, persist],
  )

  const deletePick = useCallback(
    async (id: string) => {
      const error = persist(picks.filter((p) => p.id !== id))
      return { error }
    },
    [picks, persist],
  )

  const resetSeason = useCallback(async () => {
    const error = persist([])
    return { error }
  }, [persist])

  return { picks, loading, addPick, updatePick, deletePick, resetSeason }
}
