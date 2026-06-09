import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

jest.mock('@/components/UploadScreen', () => ({
  UploadScreen: ({ onUpload }: { onUpload: (b: string, m: string) => void }) => (
    <button onClick={() => onUpload('base64data', 'image/jpeg')}>Upload</button>
  ),
}))

jest.mock('@/components/LoadingOverlay', () => ({
  LoadingOverlay: () => <div data-testid="loading-overlay">Loading</div>,
}))

jest.mock('@/components/ResultsCard', () => ({
  ResultsCard: ({ onReset }: { onReset: () => void }) => (
    <div>
      <div data-testid="results-card">Results</div>
      <button onClick={onReset}>Try another photo</button>
    </div>
  ),
}))

const MOCK_RESULT = {
  multiDogDetected: false,
  wear: [{ hex: '#8A9A7B', name: 'Sage', description: 'Nice' }],
  avoid: [{ hex: '#E74C3C', name: 'Red', reason: 'Bad' }],
  guidance: 'Wear natural textures.',
}

describe('Home page state machine', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('shows the UploadScreen in idle state', () => {
    render(<Home />)
    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('shows LoadingOverlay while fetching', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<Home />)
    await userEvent.click(screen.getByText('Upload'))

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
  })

  it('shows ResultsCard after successful analysis', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESULT,
    })

    render(<Home />)
    await userEvent.click(screen.getByText('Upload'))

    await waitFor(() => {
      expect(screen.getByTestId('results-card')).toBeInTheDocument()
    })
  })

  it('returns to idle when Try another photo is clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESULT,
    })

    render(<Home />)
    await userEvent.click(screen.getByText('Upload'))
    await waitFor(() => screen.getByTestId('results-card'))

    await userEvent.click(screen.getByText('Try another photo'))

    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('shows no_dog error message when API returns 422', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'no_dog' }),
    })

    render(<Home />)
    await userEvent.click(screen.getByText('Upload'))

    await waitFor(() => {
      expect(screen.getByText(/couldn't detect a dog/i)).toBeInTheDocument()
    })
  })

  it('shows generic error message when API returns 500', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'api_error' }),
    })

    render(<Home />)
    await userEvent.click(screen.getByText('Upload'))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })
})
