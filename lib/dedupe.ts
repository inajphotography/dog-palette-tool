import type { WearColour } from './types'

// Removes colours that are the same colour twice.
//
// This is enforcement, not colour theory. The theory lives in rules.ts and is
// what chooses good colours; this only catches the roughly one run in three
// where two of the chosen six collide anyway. Same relationship as the em dash
// gate: the rule says do not, and the check catches it when it does.
//
// Six prompt-side attempts moved this by noise, which is why it is measured
// here instead. Delete this file and its call in analyse.ts to remove it.

function lab(hex: string): [number, number, number] {
  const srgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = srgb.map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92))
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function distance(a: string, b: string): number {
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)
}

// Deliberately conservative. Only pairs that genuinely read as one colour go,
// so a palette is never thinned for being merely harmonious.
export const SAME_COLOUR = 18

// A main piece is worth more than an accent, so when two collide the smaller
// role is the one that goes.
const ROLE_RANK: Record<WearColour['role'], number> = {
  main: 0,
  second: 1,
  layer: 2,
  accent: 3,
}

const VALID_HEX = /^#[0-9A-Fa-f]{6}$/

export interface DedupeResult {
  wear: WearColour[]
  dropped: string[]
}

export function dedupeWear(wear: WearColour[], floor = 4): DedupeResult {
  const kept: WearColour[] = []
  const dropped: string[] = []

  // Most important roles first, so a collision drops the lesser slot.
  const ordered = [...wear].sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role])

  for (const colour of ordered) {
    if (!VALID_HEX.test(colour.hex)) {
      kept.push(colour)
      continue
    }
    const clash = kept.find(
      (k) => VALID_HEX.test(k.hex) && distance(k.hex, colour.hex) < SAME_COLOUR,
    )
    if (clash && kept.length > floor) {
      dropped.push(`${colour.name} was the same colour as ${clash.name}`)
    } else {
      kept.push(colour)
    }
  }

  // Restore the model's original order for the ones that survived.
  const order = new Map(wear.map((w, i) => [w.hex + w.name, i]))
  kept.sort((a, b) => (order.get(a.hex + a.name) ?? 0) - (order.get(b.hex + b.name) ?? 0))

  return { wear: kept, dropped }
}
