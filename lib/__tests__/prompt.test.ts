import { buildSystemPrompt } from '../prompt'
import type { Subject } from '../subjects'

const DOG: Subject[] = [{ noun: 'dog', nounPlural: 'dogs', coatWord: 'coat' }]
const CAT: Subject[] = [{ noun: 'cat', nounPlural: 'cats', coatWord: 'fur' }]
const DOG_HORSE: Subject[] = [
  { noun: 'dog', nounPlural: 'dogs', coatWord: 'coat' },
  { noun: 'horse', nounPlural: 'horses', coatWord: 'coat' },
]
const DOG_CAT: Subject[] = [
  { noun: 'dog', nounPlural: 'dogs', coatWord: 'coat' },
  { noun: 'cat', nounPlural: 'cats', coatWord: 'fur' },
]

describe('buildSystemPrompt', () => {
  it('single species: names the animal and asks for no_subject on miss', () => {
    const p = buildSystemPrompt(DOG)
    expect(p).toContain('a dog')
    expect(p).toContain('"detectedAnimal"')
    expect(p).toContain('"multiSubjectDetected"')
    expect(p).toContain('no_subject')
  })

  it('single cat: uses the cat coat word "fur"', () => {
    const p = buildSystemPrompt(CAT)
    expect(p).toContain('fur')
  })

  it('multi species: lists the animals and asks Claude to identify', () => {
    const p = buildSystemPrompt(DOG_HORSE)
    expect(p).toContain('dog, horse')
    expect(p.toLowerCase()).toContain('identify')
  })

  it('multi species with mixed coat words says "coat or fur"', () => {
    expect(buildSystemPrompt(DOG_CAT)).toContain('coat or fur')
  })
})
