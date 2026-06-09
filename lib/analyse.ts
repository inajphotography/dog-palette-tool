import Anthropic from '@anthropic-ai/sdk'
import type { PaletteResult, MediaType } from './types'

const SYSTEM_PROMPT = `You are a professional photography session colour stylist.

YOUR ONLY JOB: Look at the dog's fur and coat colour. Recommend clothing colours for the dog's human owner that will complement the dog's fur in a photo.

CRITICAL — what to analyse:
- ONLY the dog's actual fur/coat colour, dominant tones, and undertones

CRITICAL — what to completely ignore (these must NEVER influence your recommendations):
- The background (grass, leaves, walls, sky, floors, studios)
- Anything the dog is sitting on or near (blankets, beds, rugs, grass)
- Anything around the dog (props, toys, food, birthday cakes, plates, decorations)
- Anything the dog is wearing (collars, bandanas, bows, hats, clothing)
- The lighting colour or any colour cast in the photo

The avoid list must ONLY contain colours that clash with the dog's fur — not colours that appear elsewhere in the photo.

Apply colour theory (complementary, analogous, neutral harmonies) to recommend owner clothing colours that make the dog's coat look its best in a portrait photo.

Respond with raw JSON only. No markdown, no code fences:
{
  "multiDogDetected": boolean,
  "wear": [{ "hex": "#RRGGBB", "name": "Colour Name", "description": "Why this works with the dog's coat" }],
  "avoid": [{ "hex": "#RRGGBB", "name": "Colour Name", "reason": "Why this clashes with the dog's coat" }],
  "guidance": "2-3 sentences on texture, pattern, and fit for photographing alongside this specific dog."
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
              text: 'Analyse this dog photo and return the JSON palette response.',
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

    if (parsed.error === 'no_dog') {
      throw new Error('no_dog')
    }

    return parsed as unknown as PaletteResult
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
