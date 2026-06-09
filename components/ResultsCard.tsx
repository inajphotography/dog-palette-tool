'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { ColourSwatch } from './ColourSwatch'
import { DownloadButton } from './DownloadButton'
import { config } from '@/photographer.config'
import type { PaletteResult } from '@/lib/types'

interface ResultsCardProps {
  result: PaletteResult
  imageSrc: string
  onReset: () => void
}

export function ResultsCard({ result, imageSrc, onReset }: ResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isPortrait, setIsPortrait] = useState(false)

  return (
    <div className="min-h-screen bg-brand-ivory-light flex flex-col items-center py-6 px-4">
      {result.multiDogDetected && (
        <div
          className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800"
          data-testid="multi-dog-warning"
        >
          <strong>Heads up:</strong> We spotted more than one dog in this photo. Your palette is based on the most prominent coat. For best results, upload a photo of one dog.
        </div>
      )}

      {/* Downloadable card — html2canvas captures this ref */}
      <div ref={cardRef} className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Dog photo with overlay swatches */}
        <div className={`relative w-full bg-brand-dark ${isPortrait ? 'aspect-[3/4]' : 'h-72'}`}>
          <Image
            src={imageSrc}
            alt="Your dog"
            fill
            className="object-cover object-top"
            onLoad={(e) => {
              const img = e.currentTarget
              setIsPortrait(img.naturalHeight > img.naturalWidth)
            }}
            unoptimized
          />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2 bg-brand-dark bg-opacity-50 backdrop-blur-sm px-3 py-2 rounded-full">
            {result.wear.slice(0, 5).map((swatch) => (
              <div
                key={swatch.hex}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>
        </div>

        {/* Palette content */}
        <div className="p-5">
          <p className="text-xs font-bold text-brand-coral uppercase tracking-wider mb-3">
            Wear These
          </p>
          <div className="flex gap-3 flex-wrap mb-5">
            {result.wear.map((swatch) => (
              <ColourSwatch key={swatch.hex} hex={swatch.hex} name={swatch.name} variant="wear" />
            ))}
          </div>

          <p className="text-xs font-bold text-brand-light-green uppercase tracking-wider mb-3">
            Avoid These
          </p>
          <div className="flex gap-3 flex-wrap mb-5">
            {result.avoid.map((swatch) => (
              <ColourSwatch key={swatch.hex} hex={swatch.hex} name={swatch.name} variant="avoid" />
            ))}
          </div>

          <p className="text-sm text-brand-brown leading-relaxed border-t border-brand-ivory pt-4">
            {result.guidance}
          </p>
        </div>
      </div>

      {/* Action buttons — outside cardRef, not included in PNG */}
      <div className="flex gap-3 w-full max-w-md mt-4">
        <DownloadButton cardRef={cardRef} />
        <a
          href={config.photographer.ctaUrl}
          className="flex-1 bg-brand-dark text-brand-pink text-center py-2.5 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-colors"
        >
          {config.photographer.ctaLabel}
        </a>
      </div>

      <button
        onClick={onReset}
        className="text-sm text-brand-light-green mt-4 underline hover:text-brand-coral transition-colors"
      >
        Try another photo
      </button>
    </div>
  )
}
