import { render, screen } from '@testing-library/react'
import { WearPalette } from '../WearPalette'

const wear = [
  { hex: '#4F4740', name: 'Deep Taupe', family: 'neutrals', role: 'main' as const },
  { hex: '#6B7F94', name: 'Slate Blue', family: 'denim', role: 'main' as const },
  { hex: '#4A3529', name: 'Chocolate', family: 'earthy', role: 'main' as const },
  { hex: '#3E5068', name: 'Indigo', family: 'deep-dark', role: 'second' as const },
  { hex: '#DFD2BC', name: 'Warm Oat', family: 'pastels', role: 'layer' as const },
  { hex: '#7A3D4E', name: 'Deep Berry', family: 'jewel', role: 'accent' as const },
]
const avoid = [{ hex: '#C08E5B', name: 'Camel', reason: 'Too close to her coat.' }]

describe('WearPalette', () => {
  it('renders all six colours with their roles', () => {
    render(<WearPalette wear={wear} avoid={avoid} />)
    expect(screen.getByText('Deep Taupe')).toBeInTheDocument()
    expect(screen.getByText('Deep Berry')).toBeInTheDocument()
    expect(screen.getAllByText('Main')).toHaveLength(3)
  })

  it('says the three mains are a choice, not an outfit', () => {
    render(<WearPalette wear={wear} avoid={avoid} />)
    expect(screen.getByText(/main piece, pick one/i)).toBeInTheDocument()
  })

  it('tells them a nearby tone is fine, so they do not hunt for an exact match', () => {
    render(<WearPalette wear={wear} avoid={avoid} />)
    expect(screen.getByText(/not exact matches/i)).toBeInTheDocument()
  })

  it('renders the avoid reasons', () => {
    render(<WearPalette wear={wear} avoid={avoid} />)
    expect(screen.getByText('Too close to her coat.')).toBeInTheDocument()
  })
})
