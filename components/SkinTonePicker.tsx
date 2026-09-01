'use client'
import type { Undertone } from '@/lib/types'

// Depth drives real rules, not decoration: very light skin washes out in very
// light clothing, deeper skin flattens in pale pastels.
const DEPTHS = ['#F5DFCB', '#E8C6A6', '#D2A277', '#B07E52', '#855234', '#4E2E1E']

// Asked directly rather than through the gold-versus-silver proxy, because not
// everyone wears jewellery. The descriptors underneath carry anyone who has
// never heard the word undertone.
const UNDERTONES: { value: Undertone; label: string }[] = [
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'unsure', label: 'Not sure' },
]

interface Props {
  depth?: number
  onDepth: (d: number) => void
  undertone: Undertone
  onUndertone: (u: Undertone) => void
}

export function SkinTonePicker({ depth, onDepth, undertone, onUndertone }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2" role="radiogroup" aria-label="Skin tone depth">
        {DEPTHS.map((hex, i) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={depth === i + 1}
            aria-label={`Skin tone ${i + 1}`}
            onClick={() => onDepth(i + 1)}
            style={{ backgroundColor: hex }}
            className={`flex-1 aspect-square rounded-lg border-2 transition-colors ${
              depth === i + 1 ? 'border-brand-dark' : 'border-transparent'
            }`}
          />
        ))}
      </div>

      <div className="flex gap-1.5">
        {UNDERTONES.map((u) => (
          <button
            key={u.value}
            type="button"
            onClick={() => onUndertone(u.value)}
            className={`flex-1 text-xs rounded-lg py-2 border transition-colors ${
              undertone === u.value
                ? 'bg-brand-coral text-brand-ivory-light border-brand-coral font-bold'
                : 'bg-white text-brand-brown border-brand-pink'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-brand-light-green leading-relaxed">
        Warm skin looks golden or peachy. Cool looks pink or rosy. Not sure is completely fine.
      </p>
    </div>
  )
}
