import type { PaletteResult, Intake } from '../lib/types'
import { UNIVERSAL_BANNED } from '../lib/rules'
import { voice } from '../lib/locations'
// One definition of "the same colour", shared with the tool. When the test and
// the code each had their own, the check kept pairs the test then failed.
import { distance, SAME_COLOUR } from '../lib/dedupe'

const HEX = /^#[0-9A-Fa-f]{6}$/

// Colour maths lives here, in the test, never in the tool. Ina declined
// hardcoded colour logic in the product and that stands. A test is allowed to
// measure, and family labels turned out to be a bad proxy: two colours can sit
// in one family and still read as completely different colours.
function hueGap(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

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

  const wearCount = result.wear?.length ?? 0
  if (wearCount < 5 || wearCount > 6) {
    failures.push(`expected 5 or 6 wear, got ${wearCount}`)
  }
  if (result.avoid?.length !== 4) failures.push(`expected 4 avoid, got ${result.avoid?.length}`)
  if (result.howToWear?.length !== 5) failures.push(`expected 5 howToWear, got ${result.howToWear?.length}`)

  for (const w of result.wear ?? []) {
    if (!HEX.test(w.hex)) failures.push(`invalid hex: ${w.hex}`)
  }

  // Near-duplicates waste a slot. This is the terracotta plus burnt sienna
  // fault Ina spotted in the live tool, measured rather than guessed at.
  const wear = result.wear ?? []
  for (let i = 0; i < wear.length; i++) {
    for (let j = i + 1; j < wear.length; j++) {
      if (distance(wear[i].hex, wear[j].hex) < SAME_COLOUR) {
        failures.push(`${wear[i].name} and ${wear[j].name} read as the same colour`)
      }
    }
  }

  // Ina's rule: instruction first, then one clause of why. Anything longer is
  // a lecture, and she has rejected that phrasing twice.
  for (const line of result.howToWear ?? []) {
    const words = line.text.trim().split(/\s+/).length
    if (words > 42) failures.push(`${line.label} is ${words} words, cap is 35`)
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
