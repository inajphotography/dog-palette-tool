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
  // The palette Ina looked at and approved. Nothing in it may be removed.
  it('leaves the palette Ina approved completely alone', () => {
    const wear = [
      c('#2C3E50', 'Midnight Slate', 'main'),
      c('#4A6741', 'Forest Green', 'main'),
      c('#5B7FA6', 'Steel Blue', 'main'),
      c('#7A7A6E', 'Cool Stone', 'second'),
      c('#3D5A80', 'Washed Indigo', 'layer'),
      c('#7B2D2D', 'Deep Burgundy', 'accent'),
    ]
    const r = dedupeWear(wear)
    expect(r.wear).toHaveLength(6)
    expect(r.dropped).toEqual([])
  })

  it('drops an early clash, not only a late one', () => {
    // The floor guard used to gate on how many were kept so far, so a clash
    // in the first few colours could never be removed.
    const wear = [
      c('#C1622C', 'Terracotta', 'main'),
      c('#B25526', 'Burnt Sienna', 'main'),
      c('#2C3E50', 'Midnight Slate', 'main'),
      c('#4A6741', 'Forest Green', 'second'),
      c('#7A7A6E', 'Cool Stone', 'layer'),
      c('#7B2D2D', 'Deep Burgundy', 'accent'),
    ]
    expect(dedupeWear(wear).wear.map((w) => w.name)).not.toContain('Burnt Sienna')
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
