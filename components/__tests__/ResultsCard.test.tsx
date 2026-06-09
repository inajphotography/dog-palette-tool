import { render, screen } from '@testing-library/react'
import { ResultsCard } from '../ResultsCard'
import type { PaletteResult } from '@/lib/types'

jest.mock('../DownloadButton', () => ({
  DownloadButton: () => <button>Save palette</button>,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

const MOCK_RESULT: PaletteResult = {
  multiDogDetected: false,
  wear: [
    { hex: '#8A9A7B', name: 'Sage Green', description: 'Complements golden tones' },
    { hex: '#6B8BA4', name: 'Slate Blue', description: 'Cool contrast' },
  ],
  avoid: [
    { hex: '#E74C3C', name: 'Bright Red', reason: 'Too similar to warm tones' },
  ],
  guidance: 'Natural textures work beautifully. Avoid busy patterns.',
}

const mockOnReset = jest.fn()
const mockImageSrc = 'data:image/jpeg;base64,fakedata'

describe('ResultsCard', () => {
  beforeEach(() => mockOnReset.mockReset())

  it('renders all wear colour names', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.getByText('Sage Green')).toBeInTheDocument()
    expect(screen.getByText('Slate Blue')).toBeInTheDocument()
  })

  it('renders all avoid colour names', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.getByText('Bright Red')).toBeInTheDocument()
  })

  it('renders the guidance text', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.getByText('Natural textures work beautifully. Avoid busy patterns.')).toBeInTheDocument()
  })

  it('does not show multi-dog warning when multiDogDetected is false', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.queryByTestId('multi-dog-warning')).not.toBeInTheDocument()
  })

  it('shows multi-dog warning when multiDogDetected is true', () => {
    const multiDogResult = { ...MOCK_RESULT, multiDogDetected: true }
    render(<ResultsCard result={multiDogResult} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.getByTestId('multi-dog-warning')).toBeInTheDocument()
    expect(screen.getByText(/more than one dog/i)).toBeInTheDocument()
  })

  it('renders the CTA link with the configured label', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(
      screen.getByRole('link', { name: /back to your session guide/i }),
    ).toBeInTheDocument()
  })

  it('calls onReset when "Try another photo" is clicked', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    screen.getByText(/try another photo/i).click()
    expect(mockOnReset).toHaveBeenCalledTimes(1)
  })
})
