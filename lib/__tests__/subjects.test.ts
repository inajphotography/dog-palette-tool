import {
  isMulti,
  pickDisplayNoun,
  pickDisplayNounPlural,
  subjectByNoun,
  type Subject,
} from '../subjects'

const ONE: Subject[] = [{ noun: 'dog', nounPlural: 'dogs', coatWord: 'coat' }]
const TWO: Subject[] = [
  { noun: 'dog', nounPlural: 'dogs', coatWord: 'coat' },
  { noun: 'horse', nounPlural: 'horses', coatWord: 'coat' },
]

describe('subjects helper', () => {
  it('isMulti is false for one species, true for more', () => {
    expect(isMulti(ONE)).toBe(false)
    expect(isMulti(TWO)).toBe(true)
  })

  it('pickDisplayNoun uses the species noun when single', () => {
    expect(pickDisplayNoun(ONE, 'animal')).toBe('dog')
  })

  it('pickDisplayNoun uses the collective noun when multi', () => {
    expect(pickDisplayNoun(TWO, 'animal')).toBe('animal')
  })

  it('pickDisplayNounPlural pluralises the collective noun when multi', () => {
    expect(pickDisplayNounPlural(ONE, 'animal')).toBe('dogs')
    expect(pickDisplayNounPlural(TWO, 'pet')).toBe('pets')
  })

  it('subjectByNoun finds the matching subject', () => {
    expect(subjectByNoun(TWO, 'horse')?.coatWord).toBe('coat')
    expect(subjectByNoun(TWO, 'cat')).toBeUndefined()
  })
})
