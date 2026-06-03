import { useCallback, useEffect, useState } from 'react'
import type { Pick } from '../lib/types'
import { TOURNAMENTS } from '../data/tournaments'
import { SEASON_PICKS, DATA_VERSION } from '../data/seasonPicks'

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
const VERSION_KEY = 'pappy-data-version'

const dateByName = new Map(TOURNAMENTS.map((t) => [t.name.toLowerCase(), t.start_date]))

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// Stable, deterministic id from the tournament (one pick per tournament) so the
// committed record keeps the same ids across deploys.
function slugId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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

// The authoritative record, compiled from the committed data file.
function bundledPicks(): Pick[] {
  return SEASON_PICKS.map((s) => ({
    id: slugId(s.tournament_name),
    tournament_name: s.tournament_name,
    tournament_date: dateByName.get(s.tournament_name.toLowerCase()) ?? null,
    player_name: s.player_name,
    finish: s.finish || null,
  }))
}

function save(picks: Pick[]): string | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks))
    localStorage.setItem(VERSION_KEY, DATA_VERSION)
    return null
  } catch {
    return 'Save failed'
  }
}

/**
 * Load picks. The committed file is the source of truth: when DATA_VERSION
 * changes (a new deploy with updated picks), the bundled record is adopted and
 * replaces local storage. Between updates, in-app edits persist locally.
 */
function load(): Pick[] {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && storedVersion === DATA_VERSION) {
      return JSON.parse(raw) as Pick[]
    }
  } catch {
    /* fall through to adopt bundled */
  }
  const picks = bundledPicks()
  save(picks)
  return picks
}

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
    return save(sorted)
  }, [])

  const addPick = useCallback(
    async (input: NewPick) => ({ error: persist([...picks, { id: newId(), ...input }]) }),
    [picks, persist],
  )

  const updatePick = useCallback(
    async (id: string, patch: PickPatch) => ({
      error: persist(picks.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    }),
    [picks, persist],
  )

  const deletePick = useCallback(
    async (id: string) => ({ error: persist(picks.filter((p) => p.id !== id)) }),
    [picks, persist],
  )

  const resetSeason = useCallback(async () => ({ error: persist([]) }), [persist])

  return { picks, loading, addPick, updatePick, deletePick, resetSeason }
}
