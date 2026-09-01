import { gateText, gatePayload } from '../textGate'

describe('gateText', () => {
  it('replaces an em dash and its surrounding spaces with a comma', () => {
    const r = gateText('Choose solid colours — busy patterns compete.', [])
    expect(r.text).toBe('Choose solid colours, busy patterns compete.')
    expect(r.dashesReplaced).toBe(1)
  })

  it('replaces en dashes too', () => {
    expect(gateText('a – b', []).text).toBe('a, b')
  })

  it('leaves clean text untouched', () => {
    const clean = 'Fitted rather than loose, and matte rather than shiny.'
    const r = gateText(clean, [])
    expect(r.text).toBe(clean)
    expect(r.dashesReplaced).toBe(0)
  })

  it('does not touch hyphens', () => {
    expect(gateText('two-tone sable-and-white coat', []).text).toBe('two-tone sable-and-white coat')
  })

  it('detects banned phrases case-insensitively without altering the text', () => {
    const r = gateText('The quietest colour wins.', ['quietest'])
    expect(r.bannedFound).toEqual(['quietest'])
    expect(r.text).toBe('The quietest colour wins.')
  })
})

describe('gatePayload', () => {
  it('walks nested strings and arrays, and leaves non-strings alone', () => {
    const input = {
      wear: [{ hex: '#444B38', name: 'Deep Olive — muted', family: 'earthy' }],
      howToWear: [{ label: 'Texture', text: 'Fine knit — nothing busy.' }],
      multiSubjectDetected: false,
    }
    const r = gatePayload(input, [])
    expect(r.payload.wear[0].name).toBe('Deep Olive, muted')
    expect(r.payload.howToWear[0].text).toBe('Fine knit, nothing busy.')
    expect(r.payload.multiSubjectDetected).toBe(false)
    expect(r.dashesReplaced).toBe(2)
  })
})
