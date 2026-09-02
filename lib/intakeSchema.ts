import { z } from 'zod'
import { WARDROBE_FAMILIES, type Intake } from './types'
import { locationById, backdropById } from './locations'

const schema = z.object({
  subjectName: z.string().trim().max(40).optional(),
  skinDepth: z.number().int().min(1).max(6).optional(),
  undertone: z.enum(['warm', 'cool', 'neutral', 'unsure']).default('unsure'),
  wardrobe: z.array(z.enum(WARDROBE_FAMILIES)).default([]),
  locationId: z
    .string()
    .refine((id) => id === '' || Boolean(locationById(id)))
    .optional(),
  backdropId: z
    .string()
    .refine((id) => Boolean(backdropById(id)))
    .optional(),
  season: z.enum(['summer', 'autumn', 'winter', 'spring']).optional(),
})

export type ParseResult =
  | { ok: true; intake: Intake }
  | { ok: false; error: 'invalid_intake' | 'missing_backdrop' }

export function parseIntake(input: unknown): ParseResult {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_intake' }

  // No venue is a valid answer: someone can upload a photo and tap straight
  // through without telling us anything, and they still get a palette.
  const location = parsed.data.locationId ? locationById(parsed.data.locationId) : undefined

  // The studio backdrop is the one blocking field in the whole intake. There
  // is no safe generic answer across eight backdrops ranging from black to
  // bright yellow, and "Ina will choose" was removed on her instruction.
  if (location?.kind === 'studio' && !parsed.data.backdropId) {
    return { ok: false, error: 'missing_backdrop' }
  }

  return { ok: true, intake: parsed.data as Intake }
}
