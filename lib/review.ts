import Anthropic from '@anthropic-ai/sdk'
import type { MediaType, Intake, PaletteResult } from './types'
import { config } from '@/photographer.config'
import { buildReviewPrompt } from './prompt'
import { callModel } from './modelCall'
import type { Subject } from './subjects'

// Pass two receives the image, not just pass one's JSON. The top priority rule
// is separation from the coat and the markings, and a text-only reviewer
// cannot check that: it would confidently validate a wrong reading of the dog.
export async function reviewPalette(
  client: Anthropic,
  base64: string,
  mediaType: MediaType,
  intake: Intake,
  proposal: PaletteResult,
): Promise<PaletteResult> {
  const system = buildReviewPrompt(config.subjects as readonly Subject[], intake)
  const parsed = await callModel(
    client,
    system,
    base64,
    mediaType,
    `Here is the proposal to review:\n${JSON.stringify(proposal)}`,
  )

  if (parsed.error === 'no_subject') throw new Error('no_subject')

  return parsed as unknown as PaletteResult
}
