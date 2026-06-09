import { NextRequest, NextResponse } from 'next/server'
import { analyseImage } from '@/lib/analyse'
import type { MediaType } from '@/lib/types'

const VALID_MEDIA_TYPES: MediaType[] = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const { base64, mediaType } = await request.json()

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
    const message = error instanceof Error ? error.message : 'api_error'
    if (message === 'no_dog') {
      return NextResponse.json({ error: 'no_dog' }, { status: 422 })
    }
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
