export type AppState = 'idle' | 'loading' | 'results' | 'error'

export type MediaType = 'image/jpeg' | 'image/png' | 'image/webp'

export interface ColourSwatch {
  hex: string
  name: string
  description: string
}

export interface ColourAvoid {
  hex: string
  name: string
  reason: string
}

export interface PaletteResult {
  detectedAnimal: string
  multiSubjectDetected: boolean
  wear: ColourSwatch[]
  avoid: ColourAvoid[]
  guidance: string
}
