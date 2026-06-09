// jest.mock is hoisted above imports. With ts-jest, const/let in the factory
// scope cause TDZ errors. We avoid any outer-variable reference in the factory
// by storing the mock fn on the mock module object, then retrieving it with
// jest.requireMock() after the fact.

jest.mock('@anthropic-ai/sdk', () => {
  const createFn = jest.fn()
  return {
    __esModule: true,
    // Expose createFn so tests can retrieve it via jest.requireMock
    __mockCreate: createFn,
    default: jest.fn().mockImplementation(() => ({
      messages: { create: createFn },
    })),
  }
})

import { analyseImage } from '../analyse'

// Retrieve the shared mock function from the mocked module
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCreate: jest.Mock = (jest.requireMock('@anthropic-ai/sdk') as any).__mockCreate

const MOCK_RESULT = {
  multiDogDetected: false,
  wear: [
    { hex: '#8A9A7B', name: 'Sage Green', description: 'Complements warm golden tones' },
    { hex: '#6B8BA4', name: 'Slate Blue', description: 'Provides cool contrast' },
  ],
  avoid: [
    { hex: '#E74C3C', name: 'Bright Red', reason: 'Too similar to warm coat tones' },
  ],
  guidance: 'Natural textures work beautifully. Avoid busy patterns and logos.',
}

describe('analyseImage', () => {
  beforeEach(() => mockCreate.mockReset())

  it('returns a PaletteResult for a valid single-dog image', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(MOCK_RESULT) }],
    })

    const result = await analyseImage('base64data', 'image/jpeg')

    expect(result.multiDogDetected).toBe(false)
    expect(result.wear).toHaveLength(2)
    expect(result.wear[0].hex).toBe('#8A9A7B')
    expect(result.avoid).toHaveLength(1)
    expect(result.guidance).toBe('Natural textures work beautifully. Avoid busy patterns and logos.')
  })

  it('sets multiDogDetected true when multiple dogs are present', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ ...MOCK_RESULT, multiDogDetected: true }) }],
    })

    const result = await analyseImage('base64data', 'image/jpeg')
    expect(result.multiDogDetected).toBe(true)
  })

  it('throws no_dog when Claude cannot find a dog', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ error: 'no_dog' }) }],
    })

    await expect(analyseImage('base64data', 'image/jpeg')).rejects.toThrow('no_dog')
  })

  it('throws api_error when the response is not valid JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not valid json at all' }],
    })

    await expect(analyseImage('base64data', 'image/jpeg')).rejects.toThrow('api_error')
  })

  it('throws api_error when the Anthropic API call itself fails', async () => {
    mockCreate.mockRejectedValue(new Error('network error'))

    await expect(analyseImage('base64data', 'image/jpeg')).rejects.toThrow('api_error')
  })

  it('passes the correct media type to Claude', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(MOCK_RESULT) }],
    })

    await analyseImage('base64data', 'image/png')

    const call = mockCreate.mock.calls[0][0]
    const imageBlock = call.messages[0].content[0]
    expect(imageBlock.source.media_type).toBe('image/png')
    expect(imageBlock.source.data).toBe('base64data')
  })
})
