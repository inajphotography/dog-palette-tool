/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/analyse', () => ({ analyseImage: jest.fn() }))
import { analyseImage } from '@/lib/analyse'

const post = (body: unknown) =>
  new NextRequest('http://localhost/api/analyse', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })

const goodIntake = { wardrobe: ['neutrals'], locationId: 'yarralumla' }
const image = { base64: 'AAAA', mediaType: 'image/jpeg' }

describe('POST /api/analyse', () => {
  beforeEach(() => { (analyseImage as jest.Mock).mockReset() })

  it('400s with missing_backdrop for a studio session with no backdrop', async () => {
    const res = await POST(post({ ...image, intake: { wardrobe: [], locationId: 'studio' } }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'missing_backdrop' })
  })

  it('400s with invalid_intake for an unknown location', async () => {
    const res = await POST(post({ ...image, intake: { wardrobe: [], locationId: 'narnia' } }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid_intake' })
  })

  it('400s with invalid_image for a disallowed media type', async () => {
    const res = await POST(post({ base64: 'AAAA', mediaType: 'image/gif', intake: goodIntake }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid_image' })
  })

  it('422s when no animal is detected', async () => {
    ;(analyseImage as jest.Mock).mockRejectedValue(new Error('no_subject'))
    const res = await POST(post({ ...image, intake: goodIntake }))
    expect(res.status).toBe(422)
  })

  it('500s when the model call fails', async () => {
    ;(analyseImage as jest.Mock).mockRejectedValue(new Error('api_error'))
    const res = await POST(post({ ...image, intake: goodIntake }))
    expect(res.status).toBe(500)
  })

  it('200s and returns the palette on success', async () => {
    ;(analyseImage as jest.Mock).mockResolvedValue({ detectedAnimal: 'dog' })
    const res = await POST(post({ ...image, intake: goodIntake }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ detectedAnimal: 'dog' })
  })
})
