import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DownloadButton } from '../DownloadButton'

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import html2canvas from 'html2canvas'
const mockHtml2canvas = html2canvas as jest.MockedFunction<typeof html2canvas>

describe('DownloadButton', () => {
  const mockCardRef = { current: document.createElement('div') }

  beforeEach(() => {
    mockHtml2canvas.mockReset()
    const mockCanvas = { toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc') }
    mockHtml2canvas.mockResolvedValue(mockCanvas as unknown as HTMLCanvasElement)
  })

  it('renders the Save palette button', () => {
    render(<DownloadButton cardRef={mockCardRef} />)
    expect(screen.getByRole('button', { name: /save palette/i })).toBeInTheDocument()
  })

  it('calls html2canvas with the card element and scale 2 on click', async () => {
    render(<DownloadButton cardRef={mockCardRef} />)
    fireEvent.click(screen.getByRole('button', { name: /save palette/i }))

    await waitFor(() => {
      expect(mockHtml2canvas).toHaveBeenCalledWith(
        mockCardRef.current,
        expect.objectContaining({ scale: 2 }),
      )
    })
  })

  it('shows a Saving state and disables the button while generating', () => {
    mockHtml2canvas.mockImplementation(() => new Promise(() => {}))

    render(<DownloadButton cardRef={mockCardRef} />)
    fireEvent.click(screen.getByRole('button', { name: /save palette/i }))

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })
})
