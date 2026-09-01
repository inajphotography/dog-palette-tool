import type { PaletteResult, Intake } from '../lib/types'
import { UNIVERSAL_BANNED } from '../lib/rules'
import { voice } from '../lib/locations'

const HEX = /^#[0-9A-Fa-f]{6}$/

function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => allStrings(v, out))
  return out
}

// The mechanical faults, so Ina's attention goes only to the judgement calls.
// Everything checkable is checked here; whether a palette is too saturated is
// hers to say and deliberately not encoded.
export function checkPalette(result: PaletteResult, intake: Intake): string[] {
  const failures: string[] = []
  const strings = allStrings(result)

  if (strings.some((s) => /[—–]/.test(s))) failures.push('contains an em or en dash')

  const banned = [...UNIVERSAL_BANNED, ...voice.bannedPhrases]
  for (const phrase of banned) {
    if (strings.some((s) => s.toLowerCase().includes(phrase.toLowerCase()))) {
      failures.push(`contains banned phrase: ${phrase}`)
    }
  }

  if (result.wear?.length !== 6) failures.push(`expected 6 wear, got ${result.wear?.length}`)
  if (result.avoid?.length !== 4) failures.push(`expected 4 avoid, got ${result.avoid?.length}`)
  if (result.howToWear?.length !== 5) failures.push(`expected 5 howToWear, got ${result.howToWear?.length}`)

  const seen = new Set<string>()
  for (const w of result.wear ?? []) {
    if (seen.has(w.family)) failures.push(`two wear colours share family ${w.family}`)
    seen.add(w.family)
    if (!HEX.test(w.hex)) failures.push(`invalid hex: ${w.hex}`)
  }
  for (const a of result.avoid ?? []) {
    if (!HEX.test(a.hex)) failures.push(`invalid hex: ${a.hex}`)
  }

  if (intake.wardrobe.length) {
    // Capped at the number of families they named. Every wear colour has a
    // distinct family, so someone who ticked two chips can never yield three
    // matching colours. The two rules would otherwise contradict each other.
    const required = Math.min(3, intake.wardrobe.length)
    const owned = (result.wear ?? []).filter((w) => intake.wardrobe.includes(w.family)).length
    if (owned < required) {
      failures.push(`only ${owned} of 6 colours come from their wardrobe, need ${required}`)
    }
  }

  return failures
}
