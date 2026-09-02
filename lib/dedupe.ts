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

// Calibrated against Ina's own calls rather than picked.
//
// Pairs she named as the same colour: terracotta and burnt sienna measure 6,
// dusty blue-grey and muted sage teal 8, pale steel and soft blue-grey 6.
// Pairs inside the palette she approved: midnight slate and washed indigo 17,
// midnight slate and steel blue 29.
//
// So her line sits between 8 and 17, and 12 splits it. An earlier value of 18
// would have deleted a colour from a palette she had already said was good.
export const SAME_COLOUR = 12

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

  // Drop every clash first, then put some back if that went too far. The
  // earlier version gated on how many were kept so far, which meant an early
  // clash could never be removed: by the time the guard allowed dropping, the
  // duplicate was already in.
  const spare: WearColour[] = []

  for (const colour of ordered) {
    if (!VALID_HEX.test(colour.hex)) {
      kept.push(colour)
      continue
    }
    const clash = kept.find(
      (k) => VALID_HEX.test(k.hex) && distance(k.hex, colour.hex) < SAME_COLOUR,
    )
    if (clash) {
      dropped.push(`${colour.name} was the same colour as ${clash.name}`)
      spare.push(colour)
    } else {
      kept.push(colour)
    }
  }

  // A palette of near-identical colours would otherwise collapse to one entry.
  while (kept.length < floor && spare.length) {
    const restored = spare.shift()!
    kept.push(restored)
    dropped.pop()
  }

  // Restore the model's original order for the ones that survived.
  const order = new Map(wear.map((w, i) => [w.hex + w.name, i]))
  kept.sort((a, b) => (order.get(a.hex + a.name) ?? 0) - (order.get(b.hex + b.name) ?? 0))

  return { wear: kept, dropped }
}
