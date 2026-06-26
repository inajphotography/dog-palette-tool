import { render, screen } from '@testing-library/react'
import { LoadingOverlay } from '../LoadingOverlay'
import { displayNoun } from '@/lib/subjects'

describe('LoadingOverlay', () => {
  it('renders a spinner element', () => {
    render(<LoadingOverlay />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders an initial loading message', () => {
    render(<LoadingOverlay />)
    expect(screen.getByTestId('loading-message')).toBeInTheDocument()
  })

  it('shows a colouring message worded from the configured species', () => {
    render(<LoadingOverlay />)
    // worded from config: displayNoun is the single species, or the collective noun when multi-species
    expect(screen.getByTestId('loading-message').textContent).toContain(displayNoun)
  })
})
