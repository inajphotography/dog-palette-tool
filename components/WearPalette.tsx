'use client'
import type { WearColour, AvoidColour } from '@/lib/types'
import { config } from '@/photographer.config'

const ROLE_LABEL: Record<WearColour['role'], string> = {
  main: 'Main',
  second: 'Second',
  layer: 'Layer',
  accent: 'Accent',
}

interface Props {
  wear: WearColour[]
  avoid: AvoidColour[]
}

export function WearPalette({ wear, avoid }: Props) {
  return (
    <>
      <div>
        <p className="text-[0.62rem] font-bold tracking-widest uppercase text-brand-coral mb-2">
          Wear these
        </p>
        {/* The three mains are alternatives, not three things worn at once.
            Without saying so the roles imply a six colour outfit, which
            contradicts the two or three colour cap in the guidance. */}
        <p className="text-[0.56rem] tracking-widest uppercase text-brand-light-green font-bold mb-2">
          Main piece, pick one
        </p>
        <div className="flex flex-wrap gap-y-3 gap-x-1.5">
          {wear.map((c) => (
            <div
              key={c.hex + c.name}
              className="flex flex-col items-center gap-1"
              style={{ flex: '0 0 calc((100% - 18px) / 4)' }}
            >
              <span
                style={{ backgroundColor: c.hex }}
                className="w-10 h-10 rounded-full border border-black/10 shadow-sm"
              />
              <span className="text-[0.6rem] font-semibold text-brand-dark text-center leading-tight">
                {c.name}
              </span>
              <span className="text-[0.5rem] tracking-widest uppercase text-brand-light-green font-bold">
                {ROLE_LABEL[c.role]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[0.63rem] text-brand-light-green leading-relaxed mt-3">
          {config.copy.toneNote}
        </p>
      </div>

      <div>
        <p className="text-[0.62rem] font-bold tracking-widest uppercase text-brand-light-green mb-2">
          Avoid these
        </p>
        <div className="flex flex-col gap-1.5">
          {avoid.map((c) => (
            <div key={c.hex + c.name} className="flex gap-2 items-center">
              <span
                style={{ backgroundColor: c.hex }}
                className="w-5 h-5 rounded-full border border-black/15 shrink-0"
              />
              <span className="text-[0.69rem] text-brand-brown leading-snug">
                <b className="text-brand-dark">{c.name}.</b> {c.reason}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
