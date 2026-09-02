'use client'

import { useState } from 'react'
import type { RefObject } from 'react'

interface DownloadButtonProps {
  cardRef: RefObject<HTMLDivElement | null>
}

type Status = 'idle' | 'saving' | 'error'

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export function DownloadButton({ cardRef }: DownloadButtonProps) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleDownload() {
    if (!cardRef.current) return
    setStatus('saving')

    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      })

      const blob = await canvasToBlob(canvas)
      if (!blob) throw new Error('Could not render the card')
      const file = new File([blob], 'my-session-palette.png', { type: 'image/png' })

      // iOS ignores a programmatic download, so offer the share sheet first,
      // which is how you actually save an image to the camera roll there.
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My session palette' })
          setStatus('idle')
          return
        } catch (shareError) {
          // Cancelling the share sheet is not a failure, so stop quietly.
          if ((shareError as Error)?.name === 'AbortError') {
            setStatus('idle')
            return
          }
        }
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'my-session-palette.png'
      link.href = url
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setStatus('idle')
    } catch (error) {
      // It used to fail silently, which is why nobody knew it was broken.
      console.error('[download] failed:', error)
      setStatus('error')
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'saving'}
      className="flex-1 border-2 border-brand-coral text-brand-coral py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-pink-muted transition-colors"
    >
      {status === 'saving' ? 'Saving...' : status === 'error' ? 'Try again' : 'Save palette'}
    </button>
  )
}
