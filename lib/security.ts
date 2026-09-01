import type { NextRequest } from 'next/server'

// Max base64 image payload (~7.5MB decoded). Blocks oversized-upload DoS / runaway cost.
export const MAX_BASE64_LENGTH = 10_000_000

// --- Origin check ---
// This is a white-label tool: each client deploys to their own domain, so we
// allow same-origin requests dynamically plus any explicitly configured origins.
export function checkOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // same-origin non-CORS requests may omit Origin
  const host = request.headers.get('host')
  try {
    const o = new URL(origin)
    if (o.host === host) return true // same-origin
    if (o.hostname.endsWith('.vercel.app')) return true // preview/prod deploys
  } catch {
    return false
  }
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return allowed.includes('*') || allowed.includes(origin)
}

// --- In-memory per-IP rate limiter (best effort per warm instance) ---
// The hard ceiling is the Vercel Firewall rule (see SECURITY.md). This is cheap
// defence-in-depth so a single client cannot loop the paid Claude call.
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 8 // analyses per IP per minute
const hits = new Map<string, number[]>()

export function rateLimit(request: NextRequest): boolean {
  const ip =
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k)
    }
  }
  return recent.length <= RATE_MAX
}
