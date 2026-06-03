import { useCallback, useEffect, useRef, useState } from 'react'
import type { Pick, PicksDocument } from '../lib/types'
import { TOURNAMENTS } from '../data/tournaments'
import { SEED_PICKS } from '../data/seedPicks'
import {
  getSyncConfig,
  isSyncEnabled,
  pullRemote,
  pushRemote,
  setSyncConfig,
  SyncAuthError,
} from '../lib/sync'

export interface NewPick {
  tournament_name: string
  tournament_date: string | null
  player_name: string
  finish: string | null
}

export type PickPatch = Partial<Omit<Pick, 'id'>>

export type SyncStatus =
  | 'disabled' // no sync configured
  | 'syncing' // request in flight
  | 'synced' // up to date with remote
  | 'offline' // network error, will retry
  | 'unauthorized' // bad passphrase

interface UsePicksResult {
  picks: Pick[]
  loading: boolean
  addPick: (input: NewPick) => Promise<{ error: string | null }>
  updatePick: (id: string, patch: PickPatch) => Promise<{ error: string | null }>
  deletePick: (id: string) => Promise<{ error: string | null }>
  resetSeason: () => Promise<{ error: string | null }>
  // sync
  syncStatus: SyncStatus
  configureSync: (url: string, secret: string) => void
  syncNow: () => void
}

const STORAGE_KEY = 'pappy-one-and-done-2026'
const PUSH_DEBOUNCE_MS = 700

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

function saveLocal(doc: PicksDocument): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/**
 * Load the local document, migrating the legacy bare-array format. A brand-new
 * browser is seeded with updatedAt: 0 ("never edited") so that, if sync is on,
 * real remote data always wins over the fresh seed.
 */
function loadLocal(): PicksDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Pick[] | PicksDocument
      if (Array.isArray(parsed)) {
        // Legacy format: real user data without a timestamp — treat as current.
        return { picks: parsed, updatedAt: Date.now() }
      }
      if (parsed && Array.isArray(parsed.picks)) {
        return { picks: parsed.picks, updatedAt: Number(parsed.updatedAt) || 0 }
      }
    }
  } catch {
    /* fall through to seed */
  }
  const doc: PicksDocument = { picks: seedPicks(), updatedAt: 0 }
  saveLocal(doc)
  return doc
}

export function usePicks(): UsePicksResult {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isSyncEnabled() ? 'syncing' : 'disabled',
  )

  // Authoritative current document (kept in a ref so async callbacks see latest).
  const docRef = useRef<PicksDocument>({ picks: [], updatedAt: 0 })
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didInit = useRef(false)

  const applyDoc = useCallback((doc: PicksDocument) => {
    const sorted = sortPicks(doc.picks)
    docRef.current = { picks: sorted, updatedAt: doc.updatedAt }
    setPicks(sorted)
  }, [])

  // Reconcile local vs remote (last-write-wins). Called on init and manual sync.
  const reconcile = useCallback(async () => {
    if (!isSyncEnabled()) {
      setSyncStatus('disabled')
      return
    }
    setSyncStatus('syncing')
    try {
      const remote = await pullRemote()
      const local = docRef.current

      if (!remote) {
        // Nothing remote yet — establish the baseline from local.
        const baseline =
          local.updatedAt === 0 ? { ...local, updatedAt: Date.now() } : local
        applyDoc(baseline)
        saveLocal(baseline)
        await pushRemote(baseline)
      } else if (remote.updatedAt >= local.updatedAt) {
        applyDoc(remote)
        saveLocal(remote)
      } else {
        await pushRemote(local)
      }
      setSyncStatus('synced')
    } catch (e) {
      setSyncStatus(e instanceof SyncAuthError ? 'unauthorized' : 'offline')
    }
  }, [applyDoc])

  // Initial load (+ first sync).
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    applyDoc(loadLocal())
    setLoading(false)
    if (isSyncEnabled()) void reconcile()
  }, [applyDoc, reconcile])

  const schedulePush = useCallback((doc: PicksDocument) => {
    if (!isSyncEnabled()) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    setSyncStatus('syncing')
    pushTimer.current = setTimeout(() => {
      void (async () => {
        try {
          await pushRemote(doc)
          setSyncStatus('synced')
        } catch (e) {
          setSyncStatus(e instanceof SyncAuthError ? 'unauthorized' : 'offline')
        }
      })()
    }, PUSH_DEBOUNCE_MS)
  }, [])

  // Persist a new set of picks locally and queue a remote push.
  const commit = useCallback(
    (nextPicks: Pick[]) => {
      const doc: PicksDocument = { picks: sortPicks(nextPicks), updatedAt: Date.now() }
      docRef.current = doc
      setPicks(doc.picks)
      saveLocal(doc)
      schedulePush(doc)
      return null
    },
    [schedulePush],
  )

  const addPick = useCallback(
    async (input: NewPick) => ({
      error: commit([...docRef.current.picks, { id: newId(), ...input }]),
    }),
    [commit],
  )

  const updatePick = useCallback(
    async (id: string, patch: PickPatch) => ({
      error: commit(docRef.current.picks.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    }),
    [commit],
  )

  const deletePick = useCallback(
    async (id: string) => ({
      error: commit(docRef.current.picks.filter((p) => p.id !== id)),
    }),
    [commit],
  )

  const resetSeason = useCallback(async () => ({ error: commit([]) }), [commit])

  const configureSync = useCallback(
    (url: string, secret: string) => {
      setSyncConfig(url, secret)
      if (isSyncEnabled()) void reconcile()
      else setSyncStatus('disabled')
    },
    [reconcile],
  )

  const syncNow = useCallback(() => {
    void reconcile()
  }, [reconcile])

  return {
    picks,
    loading,
    addPick,
    updatePick,
    deletePick,
    resetSeason,
    syncStatus,
    configureSync,
    syncNow,
  }
}

export { getSyncConfig }
