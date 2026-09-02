import type { Subject } from './subjects'
import type { Intake } from './types'
import { COLOUR_THEORY, COLOUR_RULES, COAT_GROUPS, UNIVERSAL_BANNED } from './rules'
import {
  locationById,
  backdropById,
  describeLocation,
  describeBackdrop,
  voice,
} from './locations'

function speciesLine(subjects: readonly Subject[]): string {
  const nouns = subjects.map((s) => s.noun).join(', ')
  const coats = Array.from(new Set(subjects.map((s) => s.coatWord)))
  const coat = coats.length === 1 ? coats[0] : 'coat or fur'
  return subjects.length > 1
    ? `The photo shows one of these animals: ${nouns}. Identify which, then read its ${coat}, face and body.`
    : `The photo shows a ${subjects[0].noun}. Read its ${coat}, face and body.`
}

function sessionContext(intake: Intake): string {
  const location = locationById(intake.locationId)
  if (!location) return 'The session location is unknown.'
  if (location.kind === 'studio') {
    const backdrop = intake.backdropId ? backdropById(intake.backdropId) : undefined
    return backdrop
      ? `${location.description} ${describeBackdrop(backdrop)}`
      : location.description
  }
  return describeLocation(location, intake.season)
}

function personContext(intake: Intake): string {
  const depth = intake.skinDepth
    ? `Their skin depth is ${intake.skinDepth} on a six point scale, 1 lightest and 6 deepest.`
    : 'They did not give a skin depth, so do not apply depth rules.'
  const undertone =
    intake.undertone === 'unsure'
      ? 'They are not sure of their undertone, so only avoid known clashes rather than steering warm or cool.'
      : `Their undertone is ${intake.undertone}.`
  const required = Math.min(3, intake.wardrobe.length)
  const wardrobe = intake.wardrobe.length
    ? `They said they already wear these colour families: ${intake.wardrobe.join(', ')}. At least ${required} of your six colours must come from that list.`
    : 'They did not tell us what they wear, so skip the wearability step and do not mention their wardrobe in the output.'
  return `${depth} ${undertone} ${wardrobe}`
}

function voiceBlock(): string {
  const bans = [...UNIVERSAL_BANNED, ...voice.bannedPhrases].join(', ')
  return [
    'HOW TO WRITE.',
    voice.australianEnglish ? 'Australian English. Colour, favourite, realise.' : '',
    ...voice.notes,
    `Never use any of these words or phrases: ${bans}.`,
  ]
    .filter(Boolean)
    .join('\n')
}

const SHAPE = `
Respond with raw JSON only. No markdown, no code fences.
{
  "detectedAnimal": "dog",
  "detectedBreed": "Pembroke Welsh Corgi",
  "multiSubjectDetected": false,
  "coat": { "primary": "warm sable", "markings": ["white chest", "white legs"], "group": "two-tone" },
  "wear": [{ "hex": "#RRGGBB", "name": "Deep Taupe", "family": "neutrals", "role": "main" }],
  "avoid": [{ "hex": "#RRGGBB", "name": "Camel", "reason": "One short sentence." }],
  "howToWear": [{ "label": "Colours", "text": "One instruction, then one clause of why." }]
}

RULES FOR THE SHAPE.
Return 6 wear items where you can, and 5 when you cannot: three with role
"main", one "second", one "layer", one "accent". Drop the layer or the second
if six would mean repeating yourself.

Six is better than five, but five genuinely different colours is much better
than six where two are the same. Never pad the list to reach six.

The three main colours are alternatives. The person picks one of them, so they
have to be three genuinely different choices, not three shades of the same idea.
Give them clearly different depths: one deep, one mid, one lighter. Three dark
browns in the main slots is one option offered three times, which leaves the
person no choice at all.
Family must be one of: neutrals, earthy, rust-spice, jewel, dusty-muted,
pastels, deep-dark, black-white, denim, brights.
Return exactly 4 avoid items and exactly 5 howToWear items, labelled Colours,
Texture, Fit, Fabric and Leave at home in that order. Each howToWear text is at
most two short sentences and under 35 words: the instruction, then at most one
clause of why. Never a paragraph.
Write about the colours as directions to aim for, never as exact shades they
have to find. Someone reading this should understand that a nearby tone is fine.
detectedBreed is optional. Omit it if you are not confident.
If no animal from the list is visible, return exactly: {"error": "no_subject"}
All hex codes must be valid six character values starting with #.
`.trim()

export function buildAnalysePrompt(subjects: readonly Subject[], intake: Intake): string {
  const name = intake.subjectName?.trim()
  return [
    'You are a professional pet portrait stylist. You decide what the human owner should wear to a photography session so that the animal stays the subject.',
    speciesLine(subjects),
    name
      ? `The animal is called ${name}. Use their name in the writing.`
      : 'You do not know the name of the animal, so refer to them by species.',
    `THE SESSION. ${sessionContext(intake)}`,
    `THE PERSON. ${personContext(intake)}`,
    COLOUR_THEORY,
    COLOUR_RULES,
    COAT_GROUPS,
    voiceBlock(),
    SHAPE,
  ].join('\n\n')
}

export function buildReviewPrompt(subjects: readonly Subject[], intake: Intake): string {
  return [
    'You are reviewing a palette that another stylist proposed for this photo. Your job is to catch what they got wrong, not to be agreeable.',
    'You have the photo and their JSON. Check their work: look at the photo again yourself, and do not take their reading of the animal on trust.',
    speciesLine(subjects),
    `THE SESSION. ${sessionContext(intake)}`,
    `THE PERSON. ${personContext(intake)}`,
    COLOUR_THEORY,
    COLOUR_RULES,
    COAT_GROUPS,
    voiceBlock(),
    [
      'CHECK EACH OF THESE AND FIX WHAT FAILS.',
      '1. Does every wear colour clearly separate from the coat AND from the markings you can see in the photo?',
      '2. Did they read the animal correctly? If the coat or the group is wrong, redo the palette.',
      '3. Is anything bright sitting on a main role rather than an accent?',
      '4. Do any two wear colours share a family?',
      '5. Does anything break the location rules?',
      '6. Does the writing break any of the writing rules above?',
    ].join('\n'),
    'Return the corrected JSON in exactly the same shape, plus a "revisions" array of short strings saying what you changed. If nothing needed changing, return their JSON unchanged with an empty revisions array.',
    SHAPE,
    'Do your checking silently. Your entire reply must be the JSON object and nothing else. Do not narrate the checks, do not write a preamble, and do not add any commentary after the closing brace. Start your reply with the opening brace.',
  ].join('\n\n')
}
