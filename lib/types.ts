export type AppState = 'idle' | 'loading' | 'results' | 'error'

export type MediaType = 'image/jpeg' | 'image/png' | 'image/webp'

export type Undertone = 'warm' | 'cool' | 'neutral' | 'unsure'
export type Season = 'summer' | 'autumn' | 'winter' | 'spring'
export type WearRole = 'main' | 'second' | 'layer' | 'accent'

export const WARDROBE_FAMILIES = [
  'neutrals',
  'earthy',
  'rust-spice',
  'jewel',
  'dusty-muted',
  'pastels',
  'deep-dark',
  'black-white',
  'denim',
  'brights',
] as const
export type WardrobeFamily = (typeof WARDROBE_FAMILIES)[number]

export interface Intake {
  subjectName?: string
  skinDepth?: number
  undertone: Undertone
  wardrobe: WardrobeFamily[]
  locationId?: string
  backdropId?: string
  season?: Season
}

export interface WearColour {
  hex: string
  name: string
  family: WardrobeFamily
  role: WearRole
}

export interface AvoidColour {
  hex: string
  name: string
  reason: string
}

export interface HowToWearLine {
  label: string
  text: string
}

export interface PaletteResult {
  detectedAnimal: string
  detectedBreed?: string
  multiSubjectDetected: boolean
  coat: { primary: string; markings: string[]; group: string }
  wear: WearColour[]
  avoid: AvoidColour[]
  howToWear: HowToWearLine[]
}
