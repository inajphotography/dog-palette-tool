import Anthropic from '@anthropic-ai/sdk'
import type { MediaType } from './types'

export const MODEL = 'claude-sonnet-4-6'

// The model sometimes wraps the JSON in prose or a code fence, and assistant
// prefill is not supported here, so recover the object rather than failing.
// Takes the outermost balanced braces, so nested objects survive.
export function extractJson(text: string): Record<string, unknown> | null {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  const start = stripped.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(stripped.slice(start, i + 1)) as Record<string, unknown>
        } catch {
          return null
        }
      }
    }
  }
  return null
}

// Its own file so analyse.ts and review.ts can both use it without importing
// each other. Temperature is pinned at 0 because the bench harness runs each
// case three times and needs the assertions to hold on all three.
export async function callModel(
  client: Anthropic,
  system: string,
  base64: string,
  mediaType: MediaType,
  instruction: string,
  maxTokens = 2048,
): Promise<Record<string, unknown>> {
  let lastText = ''

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
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

    const parsed = extractJson(lastText)
    if (parsed) return parsed
    // otherwise fall through and retry once
  }

  console.error('[model] JSON parse failed twice, raw:', lastText.slice(0, 200))
  throw new Error('api_error')
}
