'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { DownloadButton } from './DownloadButton'
import { WearPalette } from './WearPalette'
import { HowToWearIt } from './HowToWearIt'
import { config } from '@/photographer.config'
import type { PaletteResult } from '@/lib/types'
import { subjects, displayNoun, subjectByNoun } from '@/lib/subjects'

interface ResultsCardProps {
  result: PaletteResult
  imageSrc: string
  onReset: () => void
}

export function ResultsCard({ result, imageSrc, onReset }: ResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isPortrait, setIsPortrait] = useState(false)

  const detected = subjectByNoun(subjects, result.detectedAnimal)
  const warnNoun = detected?.noun ?? displayNoun
  const warnCoat = detected?.coatWord ?? 'coat'
  const altNoun = detected?.noun ?? displayNoun

  return (
    <div className="min-h-screen bg-brand-ivory-light flex flex-col items-center py-6 px-4">
      {result.multiSubjectDetected && (
        <div
          className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800"
          data-testid="multi-subject-warning"
        >
          <strong>Heads up:</strong> We spotted more than one {warnNoun} in this photo. Your palette is based on the most prominent {warnCoat}. For best results, upload a photo of one {warnNoun}.
        </div>
      )}

      {/* Downloadable card: html2canvas captures this ref */}
      <div ref={cardRef} className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Dog photo with overlay swatches */}
        <div className={`relative w-full bg-brand-dark ${isPortrait ? 'aspect-[3/4]' : 'h-72'}`}>
          <Image
            src={imageSrc}
            alt={`Your ${altNoun}`}
            fill
            className="object-cover object-top"
            onLoad={(e) => {
              const img = e.currentTarget
              setIsPortrait(img.naturalHeight > img.naturalWidth)
            }}
            unoptimized
          />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2 items-center bg-brand-dark bg-opacity-50 backdrop-blur-sm px-3 py-2 rounded-full">
            <span className="text-[0.53rem] font-bold tracking-widest uppercase text-brand-pink mr-0.5">
              Wear
            </span>
            {result.wear.map((swatch) => (
              <div
                key={swatch.hex + swatch.name}
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 items-center bg-brand-dark bg-opacity-50 backdrop-blur-sm px-3 py-2 rounded-full">
            <span className="text-[0.53rem] font-bold tracking-widest uppercase text-brand-pink mr-0.5">
              Avoid
            </span>
            {result.avoid.map((swatch) => (
              <div
                key={swatch.hex + swatch.name}
                className="w-4 h-4 rounded-full border-2 border-white/60"
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>
        </div>

        {/* Palette content */}
        <div className="p-4">
          {result.detectedBreed && (
            <p className="text-[0.68rem] text-brand-light-green text-center mb-3 tracking-wide">
              <b className="text-brand-brown">{result.detectedBreed}</b>
              {result.coat?.primary ? ` · ${result.coat.primary}` : ''}
            </p>
          )}

          <div className="flex flex-col gap-4">
            <WearPalette wear={result.wear} avoid={result.avoid} />
            <HowToWearIt lines={result.howToWear} />
          </div>
        </div>
      </div>

      {/* Action buttons: outside cardRef, not included in PNG */}
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
