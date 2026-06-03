/**
 * Pappy & One — sync Worker.
 *
 * A single-document sync endpoint backed by Cloudflare KV, gated by a shared
 * secret (your passphrase). No accounts: anyone with the URL + secret can read
 * and write the one document. Keep the secret strong and private.
 *
 *   GET  /picks   -> 200 { picks, updatedAt } | 200 null   (no doc yet)
 *   PUT  /picks   -> 200 { picks, updatedAt }               (stores the doc)
 *
 * Auth: `Authorization: Bearer <secret>` on every request.
 */
export interface Env {
  PAPPY_KV: KVNamespace
  SYNC_SECRET: string
}

const DOC_KEY = 'pappy:2026'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
}

function json(body: unknown, status = 200): Response {
  return new Response(body === undefined ? 'null' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

// Constant-time string comparison to avoid leaking the secret via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

interface PicksDocument {
  picks: unknown[]
  updatedAt: number
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (!url.pathname.replace(/\/+$/, '').endsWith('/picks')) {
      return json({ error: 'not found' }, 404)
    }

    if (!env.SYNC_SECRET) {
      return json({ error: 'server not configured: missing SYNC_SECRET' }, 500)
    }

    const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!token || !safeEqual(token, env.SYNC_SECRET)) {
      return json({ error: 'unauthorized' }, 401)
    }

    if (request.method === 'GET') {
      const raw = await env.PAPPY_KV.get(DOC_KEY)
      if (!raw) return json(null, 200)
      return new Response(raw, {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    if (request.method === 'PUT') {
      let body: Partial<PicksDocument>
      try {
        body = (await request.json()) as Partial<PicksDocument>
      } catch {
        return json({ error: 'invalid json' }, 400)
      }
      if (!body || !Array.isArray(body.picks)) {
        return json({ error: 'expected { picks: [...] }' }, 400)
      }
      const doc: PicksDocument = {
        picks: body.picks,
        updatedAt: Number(body.updatedAt) || Date.now(),
      }
      await env.PAPPY_KV.put(DOC_KEY, JSON.stringify(doc))
      return json(doc, 200)
    }

    return json({ error: 'method not allowed' }, 405)
  },
}
