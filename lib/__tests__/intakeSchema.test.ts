import { parseIntake } from '../intakeSchema'

const base = { wardrobe: ['neutrals'], locationId: 'yarralumla' }

describe('parseIntake', () => {
  it('accepts a minimal outdoor intake', () => {
    expect(parseIntake(base).ok).toBe(true)
  })

  it('accepts an empty wardrobe', () => {
    expect(parseIntake({ ...base, wardrobe: [] }).ok).toBe(true)
  })

  it('rejects an unknown wardrobe family', () => {
    expect(parseIntake({ ...base, wardrobe: ['sparkly'] })).toEqual({ ok: false, error: 'invalid_intake' })
  })

  it('rejects an unknown location id', () => {
    expect(parseIntake({ ...base, locationId: 'narnia' })).toEqual({ ok: false, error: 'invalid_intake' })
  })

  it('rejects a skinDepth outside 1 to 6', () => {
    expect(parseIntake({ ...base, skinDepth: 9 })).toEqual({ ok: false, error: 'invalid_intake' })
  })

  it('requires a backdrop for the studio and reports it distinctly', () => {
    expect(parseIntake({ wardrobe: [], locationId: 'studio' })).toEqual({ ok: false, error: 'missing_backdrop' })
  })

  it('accepts the studio when a valid backdrop is supplied', () => {
    expect(parseIntake({ wardrobe: [], locationId: 'studio', backdropId: 'black' }).ok).toBe(true)
  })

  it('rejects an unknown backdrop id', () => {
    expect(parseIntake({ wardrobe: [], locationId: 'studio', backdropId: 'teal' })).toEqual({ ok: false, error: 'invalid_intake' })
  })

  it('defaults a missing undertone to unsure', () => {
    const r = parseIntake(base)
    expect(r.ok && r.intake.undertone).toBe('unsure')
  })
})
