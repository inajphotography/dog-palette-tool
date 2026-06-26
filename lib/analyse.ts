import Anthropic from '@anthropic-ai/sdk'
import type { PaletteResult, MediaType } from './types'
import { config } from '@/photographer.config'
import { buildSystemPrompt } from './prompt'
import type { Subject } from './subjects'

const SYSTEM_PROMPT = buildSystemPrompt(config.subjects as readonly Subject[])

export async function analyseImage(
  base64Image: string,
  mediaType: MediaType,
): Promise<PaletteResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ] as Anthropic.Messages.TextBlockParam[],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Analyse this photo and return the JSON palette response.',
            },
          ],
        },
      ],
    })

    const text =
      (response.content[0]?.type === 'text' ? (response.content[0] as { type: string; text: string }).text : '')

    // Strip markdown code fences if Claude wraps the response
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('[analyse] JSON parse failed, raw text:', text.slice(0, 200))
      throw new Error('api_error')
    }

    if (parsed.error === 'no_subject') {
      throw new Error('no_subject')
    }

    return parsed as unknown as PaletteResult
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'no_subject' || error.message === 'api_error')
    ) {
      throw error
    }
    throw new Error('api_error')
  }
}
