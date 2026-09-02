import { COLOUR_RULES, COAT_GROUPS, UNIVERSAL_BANNED } from '../rules'

describe('rules content', () => {
  it('contains no em or en dashes', () => {
    expect(COLOUR_RULES).not.toMatch(/[—–]/)
    expect(COAT_GROUPS).not.toMatch(/[—–]/)
  })

  it('states the four priority steps in order', () => {
    const i = (s: string) => COLOUR_RULES.indexOf(s)
    expect(i('Separate from the dog')).toBeGreaterThan(-1)
    expect(i('Separate from the dog')).toBeLessThan(i('Fit the location'))
    expect(i('Fit the location')).toBeLessThan(i('Suit their skin tone'))
    expect(i('Suit their skin tone')).toBeLessThan(i('Be wearable'))
  })

  it('covers all seven coat groups', () => {
    for (const g of ['Black', 'White', 'Golden', 'Brown', 'Grey', 'Red', 'Two-tone']) {
      expect(COAT_GROUPS).toContain(g)
    }
  })

  it('records that grey coats are the group that runs warm', () => {
    expect(COAT_GROUPS).toMatch(/grey[\s\S]{0,400}warm/i)
  })

  it('bans universal AI tells but not Ina-specific taste', () => {
    expect(UNIVERSAL_BANNED).toContain('game-changer')
    expect(UNIVERSAL_BANNED).not.toContain('quiet')
  })
})

import { COLOUR_THEORY } from '../rules'

describe('colour theory from Ina research', () => {
  it('carries the three dimensions by name', () => {
    for (const d of ['Hue', 'Value', 'Chroma']) expect(COLOUR_THEORY).toContain(d)
  })

  it('explains that mid coats separate on hue rather than value', () => {
    expect(COLOUR_THEORY).toMatch(/mid-tone coat[\s\S]{0,300}hue/i)
  })

  it('carries the area and chroma relationship', () => {
    expect(COLOUR_THEORY).toMatch(/larger the area[\s\S]{0,120}chroma/i)
  })

  it('restricts opposing colours to the accent', () => {
    expect(COLOUR_THEORY).toMatch(/opposite sides[\s\S]{0,200}accent/i)
  })

  it('carries the skin tone matrix for all three undertones', () => {
    for (const t of ['Warm skin', 'Cool skin', 'Neutral skin']) {
      expect(COLOUR_THEORY).toContain(t)
    }
    expect(COLOUR_THEORY).toContain('sallow')
  })

  it('carries the camera physics behind the pattern rule', () => {
    expect(COLOUR_THEORY).toMatch(/moire/i)
    expect(COLOUR_THEORY).toMatch(/blows out|sensor can hold/i)
  })

  it('contains no em dashes', () => {
    expect(COLOUR_THEORY).not.toMatch(/[—–]/)
  })
})
