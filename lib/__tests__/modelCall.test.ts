import { extractJson } from '../modelCall'

describe('extractJson', () => {
  it('parses plain JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 })
  })

  it('strips a code fence', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it('recovers JSON that follows prose, which is how pass two failed', () => {
    const prose = 'The dog is a small terrier cross. Here is the palette:\n{"wear":[{"hex":"#123456"}]}'
    expect(extractJson(prose)).toEqual({ wear: [{ hex: '#123456' }] })
  })

  it('keeps nested objects intact rather than stopping at the first brace', () => {
    expect(extractJson('note\n{"coat":{"primary":"sable","markings":["chest"]},"n":2}\ntrailing'))
      .toEqual({ coat: { primary: 'sable', markings: ['chest'] }, n: 2 })
  })

  it('is not fooled by braces inside strings', () => {
    expect(extractJson('{"reason":"a } brace in text","ok":true}'))
      .toEqual({ reason: 'a } brace in text', ok: true })
  })

  it('returns null when there is no object at all', () => {
    expect(extractJson('sorry, I cannot help with that')).toBeNull()
  })
})
