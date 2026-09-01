import { checkPalette } from '../assertions'
import type { PaletteResult, Intake } from '../../lib/types'

const wear = (families: string[]) =>
  families.map((family, i) => ({
    hex: '#44' + String(i).repeat(4),
    name: `C${i}`,
    family,
    role: i < 3 ? 'main' : 'accent',
  })) as PaletteResult['wear']

const ok: PaletteResult = {
  detectedAnimal: 'dog',
  multiSubjectDetected: false,
  coat: { primary: 'sable', markings: [], group: 'two-tone' },
  wear: wear(['neutrals', 'earthy', 'denim', 'deep-dark', 'dusty-muted', 'jewel']),
  avoid: [1, 2, 3, 4].map((n) => ({ hex: '#AAAAAA', name: `A${n}`, reason: 'Because.' })),
  howToWear: ['Colours', 'Texture', 'Fit', 'Fabric', 'Leave at home'].map((label) => ({ label, text: 'Do this.' })),
}
const intake: Intake = { undertone: 'warm', wardrobe: ['neutrals', 'earthy'], locationId: 'yarralumla' }

describe('checkPalette', () => {
  it('passes a clean result', () => {
    expect(checkPalette(ok, intake)).toEqual([])
  })

  it('fails on an em dash anywhere in the payload', () => {
    const bad = { ...ok, avoid: [{ ...ok.avoid[0], reason: 'Too close — avoid.' }, ...ok.avoid.slice(1)] }
    expect(checkPalette(bad, intake)).toContain('contains an em or en dash')
  })

  it('fails on a banned phrase', () => {
    const bad = { ...ok, howToWear: [{ label: 'Colours', text: 'A quiet colour.' }, ...ok.howToWear.slice(1)] }
    expect(checkPalette(bad, intake)).toContain('contains banned phrase: quiet')
  })

  it('fails on duplicate families', () => {
    const bad = { ...ok, wear: wear(['neutrals', 'neutrals', 'denim', 'deep-dark', 'dusty-muted', 'jewel']) }
    expect(checkPalette(bad, intake)).toContain('two wear colours share family neutrals')
  })

  it('caps the wardrobe requirement at the number of families they named', () => {
    const bad = { ...ok, wear: wear(['jewel', 'brights', 'pastels', 'deep-dark', 'dusty-muted', 'denim']) }
    expect(checkPalette(bad, intake)).toContain('only 0 of 6 colours come from their wardrobe, need 2')
  })

  it('skips the wardrobe check when they did not tell us', () => {
    const noWardrobe: Intake = { ...intake, wardrobe: [] }
    const bad = { ...ok, wear: wear(['jewel', 'brights', 'pastels', 'deep-dark', 'dusty-muted', 'denim']) }
    expect(checkPalette(bad, noWardrobe)).toEqual([])
  })

  it('fails on the wrong counts', () => {
    expect(checkPalette({ ...ok, avoid: ok.avoid.slice(0, 2) }, intake)).toContain('expected 4 avoid, got 2')
  })

  it('fails on a malformed hex', () => {
    const bad = { ...ok, wear: [{ ...ok.wear[0], hex: 'blue' }, ...ok.wear.slice(1)] as PaletteResult['wear'] }
    expect(checkPalette(bad, intake)).toContain('invalid hex: blue')
  })
})
