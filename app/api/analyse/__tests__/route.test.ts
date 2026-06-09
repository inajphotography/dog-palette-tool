/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../route'

jest.mock('@/lib/analyse', () => ({
  analyseImage: jest.fn(),
}))

import { analyseImage } from '@/lib/analyse'
const mockAnalyseImage = analyseImage as jest.MockedFunction<typeof analyseImage>

const MOCK_RESULT = {
  multiDogDetected: false,
  wear: [{ hex: '#8A9A7B', name: 'Sage Green', description: 'Works well' }],
  avoid: [{ hex: '#E74C3C', name: 'Bright Red', reason: 'Clashes' }],
  guidance: 'Natural textures work beautifully.',
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/analyse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyse', () => {
  beforeEach(() => mockAnalyseImage.mockReset())

  it('returns 200 with palette result for a valid request', async () => {
    mockAnalyseImage.mockResolvedValue(MOCK_RESULT)

    const response = await POST(makeRequest({ base64: 'abc123', mediaType: 'image/jpeg' }))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.multiDogDetected).toBe(false)
    expect(json.wear).toHaveLength(1)
  })

  it('returns 400 when base64 is missing', async () => {
    const response = await POST(makeRequest({ mediaType: 'image/jpeg' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 when mediaType is missing', async () => {
    const response = await POST(makeRequest({ base64: 'abc123' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 when mediaType is not an accepted image type', async () => {
    const response = await POST(makeRequest({ base64: 'abc123', mediaType: 'image/gif' }))
    expect(response.status).toBe(400)
  })

  it('returns 422 when no dog is detected', async () => {
    mockAnalyseImage.mockRejectedValue(new Error('no_dog'))

    const response = await POST(makeRequest({ base64: 'abc123', mediaType: 'image/jpeg' }))
    const json = await response.json()

    expect(response.status).toBe(422)
    expect(json.error).toBe('no_dog')
  })

  it('returns 500 when Claude API fails', async () => {
    mockAnalyseImage.mockRejectedValue(new Error('api_error'))

    const response = await POST(makeRequest({ base64: 'abc123', mediaType: 'image/jpeg' }))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('api_error')
  })
})
