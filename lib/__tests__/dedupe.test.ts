import { dedupeWear, distance } from '../dedupe'
import type { WearColour } from '../types'

const c = (hex: string, name: string, role: WearColour['role']): WearColour =>
  ({ hex, name, family: 'neutrals', role })

describe('distance', () => {
  it('reports near zero for the same colour', () => {
    expect(distance('#4F4740', '#4F4740')).toBeLessThan(1)
  })

  it('separates colours that look different', () => {
    expect(distance('#1B3A5C', '#DFD2BC')).toBeGreaterThan(50)
  })
})

describe('dedupeWear', () => {
  it('leaves a genuinely varied palette alone', () => {
    const wear = [
      c('#4F4740', 'Deep Taupe', 'main'),
      c('#6B7F94', 'Slate Blue', 'main'),
      c('#4A3529', 'Chocolate', 'main'),
      c('#3E5068', 'Indigo', 'second'),
      c('#DFD2BC', 'Warm Oat', 'layer'),
      c('#7A3D4E', 'Deep Berry', 'accent'),
    ]
    const r = dedupeWear(wear)
    expect(r.wear).toHaveLength(6)
    expect(r.dropped).toEqual([])
  })

  it('drops the real pair Ina reported, terracotta beside sienna', () => {
    const wear = [
      c('#C1622C', 'Warm Terracotta', 'main'),
      c('#B25526', 'Burnt Sienna', 'accent'),
      c('#1B3A5C', 'Deep Denim', 'main'),
      c('#DFD2BC', 'Warm Oat', 'layer'),
      c('#3E4436', 'Deep Olive', 'main'),
      c('#7A3D4E', 'Deep Berry', 'second'),
    ]
    const r = dedupeWear(wear)
    expect(r.wear.map((w) => w.name)).not.toContain('Burnt Sienna')
    expect(r.dropped[0]).toContain('Burnt Sienna')
  })

  it('keeps the more important role when two collide', () => {
    const wear = [
      c('#C1622C', 'Terracotta', 'accent'),
      c('#C4642E', 'Rust', 'main'),
      c('#1B3A5C', 'Deep Denim', 'main'),
      c('#DFD2BC', 'Warm Oat', 'layer'),
      c('#3E4436', 'Deep Olive', 'main'),
      c('#7A3D4E', 'Deep Berry', 'second'),
    ]
    const r = dedupeWear(wear)
    const names = r.wear.map((w) => w.name)
    expect(names).toContain('Rust')
    expect(names).not.toContain('Terracotta')
  })

  it('preserves the order the model returned', () => {
    const wear = [
      c('#4F4740', 'Deep Taupe', 'layer'),
      c('#6B7F94', 'Slate Blue', 'main'),
      c('#DFD2BC', 'Warm Oat', 'accent'),
    ]
    expect(dedupeWear(wear, 0).wear.map((w) => w.name)).toEqual([
      'Deep Taupe', 'Slate Blue', 'Warm Oat',
    ])
  })

  it('never thins a palette below the floor', () => {
    const wear = [
      c('#C1622C', 'A', 'main'),
      c('#C2632D', 'B', 'main'),
      c('#C3642E', 'C', 'main'),
      c('#C4652F', 'D', 'second'),
      c('#C56630', 'E', 'layer'),
      c('#C66731', 'F', 'accent'),
    ]
    expect(dedupeWear(wear, 4).wear.length).toBeGreaterThanOrEqual(4)
  })

  it('leaves a malformed hex alone rather than dropping it', () => {
    const wear = [c('not-a-hex', 'Mystery', 'main'), c('#6B7F94', 'Slate Blue', 'main')]
    expect(dedupeWear(wear, 0).wear).toHaveLength(2)
  })
})
