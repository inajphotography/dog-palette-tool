import { buildAnalysePrompt, buildReviewPrompt } from '../prompt'
import type { Intake } from '../types'

const subjects = [{ noun: 'dog', nounPlural: 'dogs', coatWord: 'coat' }]
const outdoor: Intake = { undertone: 'warm', wardrobe: ['earthy'], locationId: 'yarralumla', season: 'autumn' }
const studio: Intake = { undertone: 'cool', wardrobe: [], locationId: 'studio', backdropId: 'black' }

describe('buildAnalysePrompt', () => {
  it('never asks for complementary harmony, which is the original bug', () => {
    expect(buildAnalysePrompt(subjects, outdoor).toLowerCase()).not.toContain('complementary, analogous')
  })

  it('includes the rules, the coat groups and the location description', () => {
    const p = buildAnalysePrompt(subjects, outdoor)
    expect(p).toContain('Separate from the dog')
    expect(p).toContain('Two-tone, merle or heavily marked')
    expect(p).toContain('Yarralumla English Garden')
    expect(p).toContain('fallen leaves')
  })

  it('sends the backdrop family and depth for a studio session, never its hex', () => {
    const p = buildAnalysePrompt(subjects, studio)
    expect(p).toContain('Black')
    expect(p).toContain('deep')
    expect(p).not.toContain('#1A1A1A')
  })

  it('tells the model to skip the wearability step when no wardrobe was given', () => {
    expect(buildAnalysePrompt(subjects, studio)).toContain('did not tell us what they wear')
  })

  it('carries the voice rules and contains no em dashes itself', () => {
    const p = buildAnalysePrompt(subjects, outdoor)
    expect(p).toContain('Never describe a colour as quiet')
    expect(p).not.toMatch(/[—–]/)
  })
})

describe('buildReviewPrompt', () => {
  it('frames the job as checking the proposal against the image', () => {
    const p = buildReviewPrompt(subjects, outdoor)
    expect(p).toContain('look at the photo again')
    expect(p).toContain('Separate from the dog')
    expect(p).not.toMatch(/[—–]/)
  })
})
