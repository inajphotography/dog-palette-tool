import type { Config } from 'tailwindcss'
import { config as photographerConfig } from './photographer.config'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: photographerConfig.branding.coralRed,
          dark: photographerConfig.branding.darkGreen,
          'light-green': photographerConfig.branding.lightGreen,
          ivory: photographerConfig.branding.ivory,
          'ivory-light': photographerConfig.branding.ivoryLight,
          pink: photographerConfig.branding.lightPink,
          'pink-muted': photographerConfig.branding.lightPinkMuted,
          teal: photographerConfig.branding.darkTeal,
          brown: photographerConfig.branding.darkBrown,
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
