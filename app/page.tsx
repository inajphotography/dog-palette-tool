'use client'

import { useState } from 'react'
import { UploadScreen } from '@/components/UploadScreen'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { ResultsCard } from '@/components/ResultsCard'
import type { AppState, MediaType, PaletteResult } from '@/lib/types'
import { displayNoun } from '@/lib/subjects'

const ERROR_MESSAGES: Record<string, string> = {
  no_subject: `We couldn't detect a ${displayNoun} in this photo. Try a clearer photo with the ${displayNoun} clearly visible.`,
  api_error: 'Something went wrong. Please try again.',
  invalid_image:
    "That image format isn't supported. Please use a JPG, PNG, or WebP.",
}

export default function Home() {
  const [state, setState] = useState<AppState>('idle')
  const [result, setResult] = useState<PaletteResult | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(base64: string, mediaType: MediaType) {
    setState('loading')
    setError(null)

    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mediaType }),
      })

      const json = await response.json()

      if (!response.ok) {
        const errorKey = json.error ?? 'api_error'
        setError(ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.api_error)
        setState('error')
        return
      }

      setResult(json)
      setImageSrc(`data:${mediaType};base64,${base64}`)
      setState('results')
    } catch {
      setError(ERROR_MESSAGES.api_error)
      setState('error')
    }
  }

  function handleReset() {
    setState('idle')
    setResult(null)
    setImageSrc(null)
    setError(null)
  }

  if (state === 'loading') {
    return <LoadingOverlay />
  }

  if (state === 'results' && result && imageSrc) {
    return <ResultsCard result={result} imageSrc={imageSrc} onReset={handleReset} />
  }

  return (
    <>
      {state === 'error' && error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-4 flex items-start gap-3">
            <span>⚠️</span>
            <div>
              <p>{error}</p>
              <button
                onClick={handleReset}
                className="text-brand-coral underline mt-1 text-xs"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      <UploadScreen onUpload={handleUpload} />
    </>
  )
}
