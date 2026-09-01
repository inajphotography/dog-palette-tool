'use client'
import { backdrops } from '@/lib/locations'

// The one blocking field in the intake. There is no safe generic answer across
// eight backdrops running from black to bright yellow, so "Ina will choose" was
// removed and the backdrop has to be settled before the link goes out.
interface Props {
  selected?: string
  onSelect: (id: string) => void
}

export function BackdropPicker({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Studio backdrop">
      {backdrops.map((b) => (
        <button
          key={b.id}
          type="button"
          role="radio"
          aria-checked={selected === b.id}
          aria-label={b.label}
          onClick={() => onSelect(b.id)}
          className="flex flex-col items-center gap-1"
          style={{ flex: '0 0 calc((100% - 18px) / 4)' }}
        >
          <span
            style={{ backgroundColor: b.approxHex }}
            className={`w-full aspect-square rounded-lg border-2 shadow-sm transition-colors ${
              selected === b.id ? 'border-brand-coral' : 'border-transparent'
            }`}
          />
          <span className="text-[0.6rem] text-brand-brown font-semibold text-center leading-tight">
            {b.label}
          </span>
        </button>
      ))}
    </div>
  )
}
