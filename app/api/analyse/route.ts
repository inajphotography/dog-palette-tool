import { NextRequest, NextResponse } from 'next/server'
import { analyseImage } from '@/lib/analyse'
import type { MediaType } from '@/lib/types'

const VALID_MEDIA_TYPES: MediaType[] = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  console.log('[analyse] POST received')

  let base64: string, mediaType: string
  try {
    const body = await request.json()
    base64 = body.base64
    mediaType = body.mediaType
    console.log('[analyse] body parsed, mediaType:', mediaType, 'base64 length:', base64?.length)
  } catch (e) {
    console.error('[analyse] body parse error:', e)
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  if (!base64 || !mediaType) {
    return NextResponse.json(
      { error: 'Missing base64 or mediaType' },
      { status: 400 },
    )
  }

  if (!VALID_MEDIA_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: 'invalid_image' }, { status: 400 })
  }

  try {
    const result = await analyseImage(base64, mediaType)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[analyse] analyseImage error:', error instanceof Error ? error.message : error)
    const message = error instanceof Error ? error.message : 'api_error'
    if (message === 'no_dog') {
      return NextResponse.json({ error: 'no_dog' }, { status: 422 })
    }
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
