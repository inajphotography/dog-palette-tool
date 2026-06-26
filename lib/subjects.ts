import { config } from '@/photographer.config'

export interface Subject {
  noun: string
  nounPlural: string
  coatWord: string
}

export function isMulti(subjects: readonly Subject[]): boolean {
  return subjects.length > 1
}

export function pickDisplayNoun(
  subjects: readonly Subject[],
  collectiveNoun: string,
): string {
  return isMulti(subjects) ? collectiveNoun : subjects[0].noun
}

export function pickDisplayNounPlural(
  subjects: readonly Subject[],
  collectiveNoun: string,
): string {
  return isMulti(subjects) ? `${collectiveNoun}s` : subjects[0].nounPlural
}

export function subjectByNoun(
  subjects: readonly Subject[],
  noun: string,
): Subject | undefined {
  return subjects.find((s) => s.noun === noun)
}

// Config-bound convenience values for components and the API
export const subjects = config.subjects as readonly Subject[]
export const collectiveNoun = config.collectiveNoun as string
export const displayNoun = pickDisplayNoun(subjects, collectiveNoun)
export const displayNounPlural = pickDisplayNounPlural(subjects, collectiveNoun)
