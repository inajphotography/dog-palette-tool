import type { Intake } from '../types'

const mockCreate = jest.fn()
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ messages: { create: mockCreate } })),
}))

import { analyseImage } from '../analyse'

const intake: Intake = { undertone: 'warm', wardrobe: ['earthy'], locationId: 'yarralumla' }

const proposal = {
  detectedAnimal: 'dog',
  multiSubjectDetected: false,
  coat: { primary: 'warm sable', markings: ['white chest'], group: 'two-tone' },
  wear: [{ hex: '#4F4740', name: 'Deep Taupe — warm', family: 'neutrals', role: 'main' }],
  avoid: [{ hex: '#C08E5B', name: 'Camel', reason: 'Too close to her coat.' }],
  howToWear: [{ label: 'Texture', text: 'Fine knit — nothing busy.' }],
}

const reply = (body: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(body) }] })

beforeEach(() => { mockCreate.mockReset() })

describe('analyseImage', () => {
  it('runs both passes and returns the reviewed palette', async () => {
    const reviewed = { ...proposal, wear: [{ ...proposal.wear[0], name: 'Deep Taupe' }], revisions: ['renamed'] }
    mockCreate.mockResolvedValueOnce(reply(proposal)).mockResolvedValueOnce(reply(reviewed))
    const r = await analyseImage('x', 'image/jpeg', intake)
    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(r.wear[0].name).toBe('Deep Taupe')
  })

  it('sends the image to pass two as well, since it must check the coat itself', async () => {
    mockCreate.mockResolvedValueOnce(reply(proposal)).mockResolvedValueOnce(reply(proposal))
    await analyseImage('x', 'image/jpeg', intake)
    const second = mockCreate.mock.calls[1][0]
    const kinds = second.messages[0].content.map((c: { type: string }) => c.type)
    expect(kinds).toContain('image')
  })

  it('falls back to pass one when pass two throws, and still gates the text', async () => {
    mockCreate.mockResolvedValueOnce(reply(proposal)).mockRejectedValueOnce(new Error('boom'))
    const r = await analyseImage('x', 'image/jpeg', intake)
    expect(r.wear[0].name).toBe('Deep Taupe, warm')
    expect(r.howToWear[0].text).toBe('Fine knit, nothing busy.')
  })

  it('propagates no_subject from pass one without calling pass two', async () => {
    mockCreate.mockResolvedValueOnce(reply({ error: 'no_subject' }))
    await expect(analyseImage('x', 'image/jpeg', intake)).rejects.toThrow('no_subject')
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('retries once on unparseable JSON then throws api_error', async () => {
    mockCreate
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'not json' }] })
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'still not json' }] })
    await expect(analyseImage('x', 'image/jpeg', intake)).rejects.toThrow('api_error')
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })
})
