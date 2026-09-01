import { locationById, backdropById, describeLocation, describeBackdrop, locations, backdrops } from '../locations'

describe('config lookups', () => {
  it('finds a known outdoor venue and a known backdrop', () => {
    expect(locationById('yarralumla')?.kind).toBe('outdoor')
    expect(backdropById('black')?.depth).toBe('deep')
  })

  it('returns undefined for unknown ids rather than throwing', () => {
    expect(locationById('nope')).toBeUndefined()
    expect(backdropById('nope')).toBeUndefined()
  })

  it('has exactly one studio location and eight backdrops', () => {
    expect(locations.filter((l) => l.kind === 'studio')).toHaveLength(1)
    expect(backdrops).toHaveLength(8)
  })

  it('appends the seasonal note only when one exists for that season', () => {
    const yarra = locationById('yarralumla')!
    expect(describeLocation(yarra, 'autumn')).toContain('fallen leaves')
    expect(describeLocation(yarra, 'winter')).toBe(describeLocation(yarra))
  })

  it('describes a backdrop by family and depth, never by hex', () => {
    const black = backdropById('black')!
    const text = describeBackdrop(black)
    expect(text).toContain('deep')
    expect(text).not.toContain('#')
  })

  it('ships no em dashes in any location description', () => {
    for (const l of locations) expect(l.description).not.toMatch(/[—–]/)
  })
})
