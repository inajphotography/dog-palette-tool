'use client'
import { useEffect, useState } from 'react'
import { displayNoun } from '@/lib/subjects'

// Six stages, three variants each, one picked at random per mount so the wait
// reads differently on a second use.
//
// The copy is time-based and must never claim to report a finding. There is one
// HTTP request, so the front end cannot know what the analysis found until it is
// over. An earlier draft had a line saying "sable and white, a Pembroke by the
// look of her", which the browser has no way of knowing.
export const STAGES: readonly (readonly string[])[] = [
  [
    "Having a good look at {name}'s coat",
    "Getting to know {name}'s colours",
    "Admiring {name}'s coat, if we are honest",
  ],
  [
    'Reading the markings, not just the main colour',
    'Looking at the face and the chest too',
    'Taking in the whole {noun}, not just the coat',
  ],
  [
    'Frolicking through the colour wheel',
    'Rummaging about in the colour wheel',
    'Auditioning a few shades',
  ],
  [
    'Making sure nothing upstages {name}',
    'Keeping {name} the star of the show',
    'Checking nothing pulls the eye off {name}',
  ],
  [
    'Checking you will not vanish into the background',
    'Making sure you two do not blend together',
    'Putting some daylight between you and {name}',
  ],
  [
    'Marking my own homework',
    'Second-guessing myself, in a good way',
    'Having one last look before I show you',
  ],
]

const STAGE_MS = 2600

export function LoadingOverlay({ subjectName }: { subjectName?: string }) {
  const [stage, setStage] = useState(0)
  const [picks] = useState(() => STAGES.map((v) => Math.floor(Math.random() * v.length)))

  useEffect(() => {
    const id = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      STAGE_MS,
    )
    return () => clearInterval(id)
  }, [])

  const name = subjectName?.trim() || `your ${displayNoun}`
  const line = STAGES[stage][picks[stage]]
    .replace(/\{name\}/g, name)
    .replace(/\{noun\}/g, displayNoun)

  return (
    <div className="min-h-screen bg-brand-ivory-light flex flex-col items-center justify-center gap-6 px-8 text-center">
      <div
        className="w-16 h-16 rounded-full border-2 border-brand-pink-muted border-t-brand-coral animate-spin"
        aria-hidden="true"
      />
      <p
        data-testid="loading-line"
        aria-live="polite"
        className="font-heading text-lg text-brand-dark leading-snug"
      >
        {line}
      </p>
    </div>
  )
}
