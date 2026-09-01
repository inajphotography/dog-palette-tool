import Anthropic from '@anthropic-ai/sdk'
import type { PaletteResult, MediaType, Intake } from './types'
import { config } from '@/photographer.config'
import { buildAnalysePrompt } from './prompt'
import { callModel } from './modelCall'
import { reviewPalette } from './review'
import { gatePayload } from './textGate'
import { UNIVERSAL_BANNED } from './rules'
import { voice } from './locations'
import type { Subject } from './subjects'

// Identity-linked API keys must name the workspace they act in. Plain keys
// do not, and sending the header would be harmless either way, so it is set
// only when the id is configured.
export function makeClient(): Anthropic {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    ...(workspace ? { defaultHeaders: { 'anthropic-workspace-id': workspace } } : {}),
  })
}

export async function analyseImage(
  base64Image: string,
  mediaType: MediaType,
  intake: Intake,
): Promise<PaletteResult> {
  const client = makeClient()
  const banned = [...UNIVERSAL_BANNED, ...voice.bannedPhrases]
  const subjects = config.subjects as readonly Subject[]

  const proposed = await callModel(
    client,
    buildAnalysePrompt(subjects, intake),
    base64Image,
    mediaType,
    'Analyse this photo and return the JSON palette response.',
  )

  if (proposed.error === 'no_subject') throw new Error('no_subject')

  let result = proposed as unknown as PaletteResult

  // Pass two must never block the client. The text gate below still runs on
  // whatever ships, so the em dash rule holds on this path too. A banned
  // phrase getting through here is logged and shipped: one client seeing a
  // clumsy word beats a failed request. Deliberate, do not turn it into a throw.
  try {
    result = await reviewPalette(client, base64Image, mediaType, intake, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === 'no_subject') throw error
    console.error('[analyse] review pass failed, shipping pass one:', message)
  }

  const gated = gatePayload(result, banned)
  if (gated.dashesReplaced > 0) {
    console.warn(`[gate] replaced ${gated.dashesReplaced} dashes`)
  }
  if (gated.bannedFound.length) {
    console.warn('[gate] banned phrases shipped:', gated.bannedFound)
  }
  return gated.payload
}
