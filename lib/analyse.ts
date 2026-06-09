import Anthropic from '@anthropic-ai/sdk'
import type { PaletteResult, MediaType } from './types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a professional photography session colour stylist.
Analyse a dog's coat colour and undertones, then recommend clothing colours that will
photograph beautifully alongside the dog.

Apply colour theory — complementary, analogous, and neutral harmonies — to select tones
that enhance the dog's natural colouring without competing with it.

Respond with valid JSON matching this exact structure. No markdown, no explanation, just JSON:
{
  "multiDogDetected": boolean,
  "wear": [{ "hex": "#RRGGBB", "name": "Colour Name", "description": "Why this works" }],
  "avoid": [{ "hex": "#RRGGBB", "name": "Colour Name", "reason": "Why to avoid" }],
  "guidance": "2-3 sentences on texture, pattern, and fit."
}

Rules:
- Return 5-6 items in wear
- Return 3-4 items in avoid
- If no dog is visible, return: {"error": "no_dog"}
- If multiple dogs, set multiDogDetected to true and base palette on the most prominent dog
- All hex codes must be valid 6-character hex values starting with #`

export async function analyseImage(
  base64Image: string,
  mediaType: MediaType,
): Promise<PaletteResult> {
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
              text: 'Analyse this dog photo and return the JSON palette response.',
            },
          ],
        },
      ],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new Error('api_error')
    }

    if (parsed.error === 'no_dog') {
      throw new Error('no_dog')
    }

    return parsed as PaletteResult
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'no_dog' || error.message === 'api_error')
    ) {
      throw error
    }
    throw new Error('api_error')
  }
}
