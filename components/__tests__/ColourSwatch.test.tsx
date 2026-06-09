import { render, screen } from '@testing-library/react'
import { ColourSwatch } from '../ColourSwatch'

describe('ColourSwatch', () => {
  it('renders the colour name', () => {
    render(<ColourSwatch hex="#8A9A7B" name="Sage Green" variant="wear" />)
    expect(screen.getByText('Sage Green')).toBeInTheDocument()
  })

  it('renders a circle with the correct background colour', () => {
    render(<ColourSwatch hex="#8A9A7B" name="Sage Green" variant="wear" />)
    const circle = screen.getByTestId('swatch-circle')
    expect(circle).toHaveStyle({ backgroundColor: '#8A9A7B' })
  })

  it('renders an X mark for the avoid variant', () => {
    render(<ColourSwatch hex="#E74C3C" name="Bright Red" variant="avoid" />)
    expect(screen.getByTestId('swatch-x')).toBeInTheDocument()
  })

  it('does not render an X mark for the wear variant', () => {
    render(<ColourSwatch hex="#8A9A7B" name="Sage Green" variant="wear" />)
    expect(screen.queryByTestId('swatch-x')).not.toBeInTheDocument()
  })
})
