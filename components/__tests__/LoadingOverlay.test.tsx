import { render, screen } from '@testing-library/react'
import { LoadingOverlay } from '../LoadingOverlay'

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
    // default config species is "dog"
    expect(screen.getByTestId('loading-message').textContent).toMatch(/dog/i)
  })
})
