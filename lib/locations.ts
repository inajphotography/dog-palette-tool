import { config } from '@/photographer.config'

export type LocationKind = 'studio' | 'outdoor'
export type Season = 'summer' | 'autumn' | 'winter' | 'spring'

export interface PhotoLocation {
  id: string
  label: string
  kind: LocationKind
  description: string
  palette: readonly string[]
  seasonalNotes?: Partial<Record<Season, string>>
}

export interface Backdrop {
  id: string
  label: string
  family: string
  depth: 'light' | 'mid' | 'deep'
  approxHex: string
}

export interface Voice {
  australianEnglish: boolean
  bannedPhrases: readonly string[]
  notes: readonly string[]
}

export const locations = config.locations as readonly PhotoLocation[]
export const backdrops = config.backdrops as readonly Backdrop[]
export const voice = config.voice as Voice

export function locationById(id: string): PhotoLocation | undefined {
  return locations.find((l) => l.id === id)
}

export function backdropById(id: string): Backdrop | undefined {
  return backdrops.find((b) => b.id === id)
}

export function describeLocation(location: PhotoLocation, season?: Season): string {
  const note = season ? location.seasonalNotes?.[season] : undefined
  const palette = location.palette.length
    ? ` Its dominant colours, most prominent first, are ${location.palette.join(', ')}.`
    : ''
  return `${location.label}. ${location.description}${palette}${note ? ` ${note}` : ''}`
}

// Deliberately family and depth, never the hex. Ina edits her images, so the
// backdrop as delivered is not the backdrop as shot, and an exact value would
// be false precision. approxHex exists only to render the picker swatch.
export function describeBackdrop(backdrop: Backdrop): string {
  return `The backdrop is ${backdrop.label}, a ${backdrop.family} in a ${backdrop.depth} tone.`
}
