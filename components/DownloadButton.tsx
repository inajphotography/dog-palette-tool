'use client'

import { useState } from 'react'
import type { RefObject } from 'react'

interface DownloadButtonProps {
  cardRef: RefObject<HTMLDivElement | null>
}

export function DownloadButton({ cardRef }: DownloadButtonProps) {
  const [saving, setSaving] = useState(false)

  async function handleDownload() {
    if (!cardRef.current) return
    setSaving(true)

    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      const link = document.createElement('a')
      link.download = 'my-session-palette.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={saving}
      className="flex-1 border-2 border-brand-coral text-brand-coral py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-pink-muted transition-colors"
    >
      {saving ? 'Saving...' : 'Save palette'}
    </button>
  )
}
