'use client'

import { useEffect, useState } from 'react'
import { displayNoun } from '@/lib/subjects'

const MESSAGES = [
  `Analysing your ${displayNoun}'s colouring...`,
  'Building your personalised palette...',
  'Almost ready...',
]

export function LoadingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-brand-ivory-light flex flex-col items-center justify-center z-50">
      <div
        className="w-12 h-12 rounded-full border-4 border-brand-ivory border-t-brand-coral animate-spin mb-6"
        data-testid="spinner"
      />
      <p
        className="font-heading text-lg text-brand-dark text-center px-8"
        data-testid="loading-message"
      >
        {MESSAGES[messageIndex]}
      </p>
      <div className="flex gap-2 mt-6">
        {MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === messageIndex ? 'bg-brand-coral' : 'bg-brand-ivory'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
