import type { Metadata } from 'next'
import { Alice, Quicksand } from 'next/font/google'
import { config } from '@/photographer.config'
import './globals.css'

const alice = Alice({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: `${config.copy.pageTitle} | ${config.photographer.name}`,
  description: config.copy.pageSubtitle,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${alice.variable} ${quicksand.variable} font-body bg-brand-ivory-light min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
