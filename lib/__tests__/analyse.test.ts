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
  detectedAnimal: 'dog',
  multiSubjectDetected: false,
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

    expect(result.multiSubjectDetected).toBe(false)
    expect(result.detectedAnimal).toBe('dog')
    expect(result.wear).toHaveLength(2)
    expect(result.wear[0].hex).toBe('#8A9A7B')
    expect(result.avoid).toHaveLength(1)
    expect(result.guidance).toBe('Natural textures work beautifully. Avoid busy patterns and logos.')
  })

  it('sets multiSubjectDetected true when multiple animals are present', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ ...MOCK_RESULT, multiSubjectDetected: true }) }],
    })

    const result = await analyseImage('base64data', 'image/jpeg')
    expect(result.multiSubjectDetected).toBe(true)
  })

  it('throws no_subject when Claude cannot find the animal', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ error: 'no_subject' }) }],
    })

    await expect(analyseImage('base64data', 'image/jpeg')).rejects.toThrow('no_subject')
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
