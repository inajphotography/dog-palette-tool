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
