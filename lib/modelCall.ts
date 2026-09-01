import Anthropic from '@anthropic-ai/sdk'
import type { MediaType } from './types'

export const MODEL = 'claude-sonnet-4-6'

// Its own file so analyse.ts and review.ts can both use it without importing
// each other. Temperature is pinned at 0 because the bench harness runs each
// case three times and needs the assertions to hold on all three.
export async function callModel(
  client: Anthropic,
  system: string,
  base64: string,
  mediaType: MediaType,
  instruction: string,
): Promise<Record<string, unknown>> {
  let lastText = ''

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0,
      system: [
        { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
      ] as Anthropic.Messages.TextBlockParam[],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: instruction },
          ],
        },
      ],
    })

    const block = response.content[0]
    lastText = block?.type === 'text' ? (block as { text: string }).text : ''
    const cleaned = lastText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    try {
      return JSON.parse(cleaned) as Record<string, unknown>
    } catch {
      // fall through and retry once
    }
  }

  console.error('[model] JSON parse failed twice, raw:', lastText.slice(0, 200))
  throw new Error('api_error')
}
