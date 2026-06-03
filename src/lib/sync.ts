import type { PicksDocument } from './types'

// ---------------------------------------------------------------------------
// Sync config — the Cloudflare Worker URL + passphrase, stored locally so the
// Vercel build needs no env vars. VITE_SYNC_URL can pre-fill the URL if baked in.
// ---------------------------------------------------------------------------
const URL_KEY = 'pappy-sync-url'
const SECRET_KEY = 'pappy-sync-key'

export interface SyncConfig {
  url: string
  secret: string
}

function readLocal(key: string): string {
  try {
    return localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

export function getSyncConfig(): SyncConfig {
  const envUrl = (import.meta.env.VITE_SYNC_URL ?? '') as string
  const url = (readLocal(URL_KEY) || envUrl).trim().replace(/\/+$/, '')
  const secret = readLocal(SECRET_KEY).trim()
  return { url, secret }
}

export function setSyncConfig(url: string, secret: string): void {
  try {
    localStorage.setItem(URL_KEY, url.trim().replace(/\/+$/, ''))
    localStorage.setItem(SECRET_KEY, secret.trim())
  } catch {
    /* ignore storage errors */
  }
}

export function clearSyncConfig(): void {
  try {
    localStorage.removeItem(URL_KEY)
    localStorage.removeItem(SECRET_KEY)
  } catch {
    /* ignore */
  }
}

export function isSyncEnabled(): boolean {
  const { url, secret } = getSyncConfig()
  return Boolean(url) && Boolean(secret)
}

/** Thrown when the Worker rejects the passphrase (HTTP 401). */
export class SyncAuthError extends Error {
  constructor() {
    super('Unauthorized — check the passphrase.')
    this.name = 'SyncAuthError'
  }
}

// Build the /picks endpoint from a base URL, tolerating a pasted-in /picks.
function endpoint(url: string): string {
  return /\/picks\/?$/.test(url) ? url.replace(/\/+$/, '') : `${url}/picks`
}

/** Fetch the remote document, or null if none stored yet. */
export async function pullRemote(): Promise<PicksDocument | null> {
  const { url, secret } = getSyncConfig()
  if (!url || !secret) return null
  const res = await fetch(endpoint(url), {
    headers: { Authorization: `Bearer ${secret}` },
  })
  if (res.status === 401) throw new SyncAuthError()
  if (!res.ok) throw new Error(`pull failed (${res.status})`)
  const data = (await res.json()) as PicksDocument | null
  if (data && Array.isArray(data.picks)) {
    return { picks: data.picks, updatedAt: Number(data.updatedAt) || 0 }
  }
  return null
}

/** Store the document remotely. */
export async function pushRemote(doc: PicksDocument): Promise<void> {
  const { url, secret } = getSyncConfig()
  if (!url || !secret) return
  const res = await fetch(endpoint(url), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  })
  if (res.status === 401) throw new SyncAuthError()
  if (!res.ok) throw new Error(`push failed (${res.status})`)
}
