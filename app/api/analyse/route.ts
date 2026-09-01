import { NextRequest, NextResponse } from 'next/server'
import { analyseImage } from '@/lib/analyse'
import { checkOrigin, rateLimit, MAX_BASE64_LENGTH } from '@/lib/security'
import { parseIntake } from '@/lib/intakeSchema'
import type { MediaType } from '@/lib/types'

const VALID_MEDIA_TYPES: MediaType[] = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  console.log('[analyse] POST received')

  // --- Abuse protection: origin allowlist + per-IP rate limit ---
  if (!checkOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!rateLimit(request)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let base64: string, mediaType: MediaType, rawIntake: unknown
  try {
    const body = await request.json()
    base64 = body.base64
    mediaType = body.mediaType as MediaType
    rawIntake = body.intake
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

  if (typeof base64 !== 'string' || base64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: 'image_too_large' }, { status: 413 })
  }

  if (!VALID_MEDIA_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: 'invalid_image' }, { status: 400 })
  }

  const parsedIntake = parseIntake(rawIntake)
  if (!parsedIntake.ok) {
    return NextResponse.json({ error: parsedIntake.error }, { status: 400 })
  }

  try {
    const result = await analyseImage(base64, mediaType, parsedIntake.intake)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[analyse] analyseImage error:', error instanceof Error ? error.message : error)
    const message = error instanceof Error ? error.message : 'api_error'
    if (message === 'no_subject') {
      return NextResponse.json({ error: 'no_subject' }, { status: 422 })
    }
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
