'use client'

import { useState } from 'react'
import type { RefObject } from 'react'

interface DownloadButtonProps {
  cardRef: RefObject<HTMLDivElement | null>
}

type Status = 'idle' | 'saving' | 'error'

export function DownloadButton({ cardRef }: DownloadButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [detail, setDetail] = useState<string | null>(null)

  async function handleDownload() {
    if (!cardRef.current) return
    setStatus('saving')
    setDetail(null)

    try {
      // Was html2canvas, which last shipped in 2022 and cannot parse the
      // color-mix() and oklab() that Tailwind 4 emits, so it threw before
      // drawing anything and the button just said try again forever.
      const { domToBlob } = await import('modern-screenshot')
      const blob = await domToBlob(cardRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        type: 'image/png',
      })
      if (!blob) throw new Error('The card could not be drawn')

      const file = new File([blob], 'my-session-palette.png', { type: 'image/png' })

      // On a phone this is the only route to the camera roll: the share sheet
      // opens and Save Image puts it in Photos. A programmatic download does
      // nothing on iOS.
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My session palette' })
          setStatus('idle')
          return
        } catch (shareError) {
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
      // Rendering a whole card to an image is the least reliable thing here,
      // and a broken-looking button is worse than no button. Fall back to the
      // thing every phone can already do, and log the real reason for us.
      console.error('[download] failed:', error)
      setDetail(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={status === 'saving'}
        className="w-full border-2 border-brand-coral text-brand-coral py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-pink-muted transition-colors"
      >
        {status === 'saving' ? 'Saving...' : 'Save palette'}
      </button>
      {status === 'error' && (
        <p className="text-[0.62rem] text-brand-brown leading-snug text-center">
          Screenshot this page to keep your palette.
        </p>
      )}
      {status === 'error' && detail && process.env.NEXT_PUBLIC_DEBUG_SAVE === '1' && (
        <p className="text-[0.55rem] text-red-700 leading-tight text-center break-all">{detail}</p>
      )}
    </div>
  )
}
