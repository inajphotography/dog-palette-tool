import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadScreen } from '../UploadScreen'
import { config } from '@/photographer.config'

const mockOnUpload = jest.fn()

describe('UploadScreen', () => {
  beforeEach(() => mockOnUpload.mockReset())

  it('renders the page title from config', () => {
    render(<UploadScreen onUpload={mockOnUpload} />)
    expect(screen.getByText(config.copy.pageTitle)).toBeInTheDocument()
  })

  it('renders all upload guidelines from config', () => {
    render(<UploadScreen onUpload={mockOnUpload} />)
    config.copy.uploadGuidelines.forEach((guideline) => {
      expect(screen.getByText(guideline)).toBeInTheDocument()
    })
  })

  it('renders the privacy note from config', () => {
    render(<UploadScreen onUpload={mockOnUpload} />)
    expect(screen.getByText(config.copy.privacyNote)).toBeInTheDocument()
  })

  it('keeps the submit button disabled until a file is selected', () => {
    render(<UploadScreen onUpload={mockOnUpload} />)
    expect(screen.getByRole('button', { name: /create my palette/i })).toBeDisabled()
  })

  it('enables the submit button once a valid file is selected', async () => {
    render(<UploadScreen onUpload={mockOnUpload} />)

    const file = new File(['fake'], 'dog.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    await userEvent.upload(input, file)

    expect(screen.getByRole('button', { name: /create my palette/i })).not.toBeDisabled()
  })

  it('shows a size error and keeps button disabled when file exceeds 50MB', async () => {
    render(<UploadScreen onUpload={mockOnUpload} />)

    const largeFile = new File([new ArrayBuffer(51 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    await userEvent.upload(input, largeFile)

    expect(screen.getByText(/file must be under 50mb/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create my palette/i })).toBeDisabled()
  })
})
