'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { config } from '@/photographer.config'
import type { MediaType } from '@/lib/types'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB, we resize before sending
const MAX_DIMENSION = 1200 // resize to max 1200px on longest side
// Accept any image the browser can decode, includes HEIC on iOS (browser converts it)
const ACCEPT = 'image/*'

interface UploadScreenProps {
  onUpload: (base64: string, mediaType: MediaType) => void
}

function resizeAndEncode(file: File): Promise<{ base64: string; mediaType: MediaType }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width = MAX_DIMENSION
          } else {
            width = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('canvas')); return }
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        const base64 = dataUrl.split(',')[1]
        resolve({ base64, mediaType: 'image/jpeg' })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSizeError(false)

    if (file.size > MAX_FILE_SIZE) {
      setSizeError(true)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    try {
      const { base64, mediaType } = await resizeAndEncode(selectedFile)
      onUpload(base64, mediaType)
    } catch {
      // fallback: send as-is if canvas resize fails
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const [header, base64] = dataUrl.split(',')
        const mediaType = (header.split(':')[1].split(';')[0] || 'image/jpeg') as MediaType
        onUpload(base64, mediaType)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  return (
    <div className="min-h-screen bg-brand-ivory-light flex flex-col">
      <header className="bg-brand-dark py-4 px-6 flex items-center justify-center">
        <Image
          src={config.photographer.logoPath}
          alt={config.photographer.name}
          width={180}
          height={56}
          className="h-12 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'block'
          }}
          unoptimized
        />
        <span
          className="font-heading text-brand-pink tracking-widest text-sm uppercase"
          style={{ display: 'none' }}
        >
          {config.photographer.name}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
        <h1 className="font-heading text-2xl text-brand-dark text-center mb-2">
          {config.copy.pageTitle}
        </h1>
        <p className="text-sm text-brand-brown text-center mb-6 leading-relaxed">
          {config.copy.pageSubtitle}
        </p>

        <div className="w-full bg-brand-pink-muted rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-brand-coral uppercase tracking-wider mb-3">
            Photo tips
          </p>
          <ul className="space-y-2">
            {config.copy.uploadGuidelines.map((guideline) => (
              <li key={guideline} className="text-sm text-brand-dark flex items-start gap-2">
                <span className="text-brand-coral mt-0.5 shrink-0">✓</span>
                {guideline}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-brand-coral rounded-2xl p-8 flex flex-col items-center gap-2 bg-white mb-4 hover:bg-brand-ivory transition-colors"
          >
            <span className="text-4xl">📷</span>
            <span className="text-sm font-bold text-brand-coral">
              {selectedFile ? selectedFile.name : 'Tap to upload'}
            </span>
            <span className="text-xs text-brand-light-green">
              Any photo from your camera roll
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="hidden"
            data-testid="file-input"
          />

          {sizeError && (
            <p className="text-sm text-red-600 text-center mb-3">
              File must be under 50MB. Please choose a smaller image.
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedFile}
            className="w-full bg-brand-coral text-brand-ivory-light py-3 rounded-xl font-bold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
          >
            Create my palette
          </button>
        </form>

        <p className="text-xs text-brand-light-green mt-4 text-center">
          {config.copy.privacyNote}
        </p>
      </main>
    </div>
  )
}
