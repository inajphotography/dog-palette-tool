import { checkPalette } from '../assertions'
import type { PaletteResult, Intake } from '../../lib/types'

// A real palette from a bench run: spread in hue and lightness.
const GOOD = [
  { hex: '#4F4740', name: 'Deep Taupe', family: 'neutrals', role: 'main' },
  { hex: '#6B7F94', name: 'Slate Blue', family: 'denim', role: 'main' },
  { hex: '#7A3D4E', name: 'Deep Berry', family: 'jewel', role: 'main' },
  { hex: '#DFD2BC', name: 'Warm Oatmeal', family: 'pastels', role: 'second' },
  { hex: '#8E9B84', name: 'Dusty Sage', family: 'dusty-muted', role: 'layer' },
  { hex: '#3E5068', name: 'Indigo', family: 'deep-dark', role: 'accent' },
] as PaletteResult['wear']

const base: PaletteResult = {
  detectedAnimal: 'dog',
  multiSubjectDetected: false,
  coat: { primary: 'sable', markings: [], group: 'two-tone' },
  wear: GOOD,
  avoid: [1, 2, 3, 4].map((n) => ({ hex: '#AAAAAA', name: `A${n}`, reason: 'Because.' })),
  howToWear: ['Colours', 'Texture', 'Fit', 'Fabric', 'Leave at home'].map((label) => ({ label, text: 'Do this.' })),
}
const intake: Intake = { undertone: 'warm', wardrobe: ['neutrals', 'denim'], locationId: 'yarralumla' }

describe('checkPalette', () => {
  it('passes a clean result', () => {
    expect(checkPalette(base, intake)).toEqual([])
  })

  it('fails on an em dash anywhere in the payload', () => {
    const bad = { ...base, avoid: [{ ...base.avoid[0], reason: 'Too close — avoid.' }, ...base.avoid.slice(1)] }
    expect(checkPalette(bad, intake)).toContain('contains an em or en dash')
  })

  it('fails on a banned phrase', () => {
    const bad = { ...base, howToWear: [{ label: 'Colours', text: 'A quiet colour.' }, ...base.howToWear.slice(1)] }
    expect(checkPalette(bad, intake)).toContain('contains banned phrase: quiet')
  })

  it('catches near-duplicates, which is the terracotta and burnt sienna fault', () => {
    const wear = [...GOOD]
    wear[1] = { hex: '#C1622C', name: 'Warm Terracotta', family: 'rust-spice', role: 'main' }
    wear[2] = { hex: '#B25526', name: 'Burnt Sienna', family: 'earthy', role: 'main' }
    const failures = checkPalette({ ...base, wear } as PaletteResult, intake)
    expect(failures).toContain('Warm Terracotta and Burnt Sienna read as the same colour')
  })

  it('allows two colours in the same family when they genuinely differ', () => {
    const wear = [...GOOD]
    wear[3] = { hex: '#DFD2BC', name: 'Warm Oatmeal', family: 'neutrals', role: 'second' }
    expect(checkPalette({ ...base, wear } as PaletteResult, intake)).toEqual([])
  })

  it('fails a guidance line that runs to a paragraph', () => {
    const long = { label: 'Colours', text: 'word '.repeat(50).trim() }
    expect(checkPalette({ ...base, howToWear: [long, ...base.howToWear.slice(1)] }, intake))
      .toContain('Colours is 50 words, cap is 35')
  })

  it('caps the wardrobe requirement at the number of families they named', () => {
    const wear = GOOD.map((w) => ({ ...w, family: 'jewel' as const }))
    const failures = checkPalette({ ...base, wear } as PaletteResult, intake)
    expect(failures).toContain('only 0 of 6 colours come from their wardrobe, need 2')
  })

  it('skips the wardrobe check when they did not tell us', () => {
    expect(checkPalette(base, { ...intake, wardrobe: [] })).toEqual([])
  })

  it('fails on the wrong counts', () => {
    expect(checkPalette({ ...base, avoid: base.avoid.slice(0, 2) }, intake)).toContain('expected 4 avoid, got 2')
  })

  it('fails on a malformed hex', () => {
    const wear = [{ ...GOOD[0], hex: 'blue' }, ...GOOD.slice(1)] as PaletteResult['wear']
    expect(checkPalette({ ...base, wear }, intake)).toContain('invalid hex: blue')
  })
})
