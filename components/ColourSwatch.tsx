'use client'

interface ColourSwatchProps {
  hex: string
  name: string
  variant: 'wear' | 'avoid'
}

export function ColourSwatch({ hex, name, variant }: ColourSwatchProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
        style={{ backgroundColor: hex }}
        data-testid="swatch-circle"
      >
        {variant === 'avoid' && (
          <span
            className="text-white text-base font-bold leading-none"
            data-testid="swatch-x"
          >
            ✕
          </span>
        )}
      </div>
      <span className="text-xs text-brand-dark text-center leading-tight max-w-[52px]">
        {name}
      </span>
    </div>
  )
}
