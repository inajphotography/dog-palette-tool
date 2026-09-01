'use client'
import type { HowToWearLine } from '@/lib/types'

// Coloured labels from the version two photographers picked, carrying the
// conversational sentences Ina's client picked. Instruction first, then one
// clause of why.
export function HowToWearIt({ lines }: { lines: HowToWearLine[] }) {
  return (
    <div>
      <p className="text-[0.62rem] font-bold tracking-widest uppercase text-brand-coral mb-2">
        How to wear it
      </p>
      <div className="bg-brand-ivory rounded-xl px-3 py-3 flex flex-col gap-2">
        {lines.map((l) => (
          <div key={l.label} className="flex flex-col">
            <span className="text-[0.57rem] tracking-widest uppercase text-brand-teal font-bold">
              {l.label}
            </span>
            <span className="text-[0.73rem] text-brand-dark leading-snug">{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
