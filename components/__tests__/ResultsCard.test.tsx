import { render, screen } from '@testing-library/react'
import { ResultsCard } from '../ResultsCard'
import type { PaletteResult } from '@/lib/types'

jest.mock('../DownloadButton', () => ({
  DownloadButton: () => <button>Save palette</button>,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

const MOCK_RESULT: PaletteResult = {
  detectedAnimal: 'dog',
  multiSubjectDetected: false,
  coat: { primary: 'warm gold', markings: [], group: 'golden' },
  wear: [
    { hex: '#8A9A7B', name: 'Sage Green', family: 'dusty-muted', role: 'main' },
    { hex: '#6B8BA4', name: 'Slate Blue', family: 'denim', role: 'second' },
  ],
  avoid: [
    { hex: '#E74C3C', name: 'Bright Red', reason: 'Too similar to warm tones' },
  ],
  howToWear: [
    { label: 'Texture', text: 'Natural textures work beautifully.' },
    { label: 'Leave at home', text: 'Busy patterns.' },
  ],
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
    expect(screen.getByText('Bright Red.')).toBeInTheDocument()
  })

  it('renders the how to wear lines', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.getByText('Natural textures work beautifully.')).toBeInTheDocument()
  })

  it('does not show multi-subject warning when multiSubjectDetected is false', () => {
    render(<ResultsCard result={MOCK_RESULT} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.queryByTestId('multi-subject-warning')).not.toBeInTheDocument()
  })

  it('shows multi-subject warning worded with the detected animal', () => {
    const multi = { ...MOCK_RESULT, multiSubjectDetected: true }
    render(<ResultsCard result={multi} imageSrc={mockImageSrc} onReset={mockOnReset} />)
    expect(screen.getByTestId('multi-subject-warning')).toBeInTheDocument()
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
