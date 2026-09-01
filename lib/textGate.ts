// Deterministic text checks that run on every response, including the
// pass-one fallback path. An AI-only gate cannot be trusted with a rule
// this mechanical: em dashes are already reaching production today, and
// the static copy has been cleaned twice without ever fixing the output.

export interface GateResult {
  text: string
  dashesReplaced: number
  bannedFound: string[]
}

export interface GateReport<T> {
  payload: T
  dashesReplaced: number
  bannedFound: string[]
}

// Em dash U+2014 and en dash U+2013, with any surrounding whitespace.
// A comma is always grammatical in the positions these occupy, which is
// why this can repair rather than just flag.
const DASHES = /\s*[—–]\s*/g

export function gateText(text: string, banned: readonly string[]): GateResult {
  const matches = text.match(DASHES)
  const cleaned = text.replace(DASHES, ', ')
  const lower = cleaned.toLowerCase()
  const bannedFound = banned.filter(
    (phrase) => phrase.length > 0 && lower.includes(phrase.toLowerCase()),
  )
  return {
    text: cleaned,
    dashesReplaced: matches ? matches.length : 0,
    bannedFound,
  }
}

export function gatePayload<T>(payload: T, banned: readonly string[]): GateReport<T> {
  let dashesReplaced = 0
  const bannedFound = new Set<string>()

  function walk(value: unknown): unknown {
    if (typeof value === 'string') {
      const r = gateText(value, banned)
      dashesReplaced += r.dashesReplaced
      r.bannedFound.forEach((b) => bannedFound.add(b))
      return r.text
    }
    if (Array.isArray(value)) return value.map(walk)
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, walk(v)]),
      )
    }
    return value
  }

  return {
    payload: walk(payload) as T,
    dashesReplaced,
    bannedFound: Array.from(bannedFound),
  }
}
