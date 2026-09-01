import { render, screen, act } from '@testing-library/react'
import { LoadingOverlay, STAGES } from '../LoadingOverlay'

beforeEach(() => { jest.useFakeTimers() })
afterEach(() => { jest.useRealTimers() })

describe('LoadingOverlay copy', () => {
  it('has six stages with three variants each', () => {
    expect(STAGES).toHaveLength(6)
    STAGES.forEach((s) => expect(s).toHaveLength(3))
  })

  it('excludes the lines Ina rejected and contains no em dashes', () => {
    const all = STAGES.flat().join(' ')
    expect(all).not.toContain('Talking myself out of the bold ones')
    expect(all).not.toContain('Turning the loud ones down')
    expect(all).not.toMatch(/[—–]/)
  })

  it('never claims to report a finding, since one request cannot know one', () => {
    const all = STAGES.flat().join(' ')
    expect(all).not.toMatch(/sable|Pembroke|white chest|golden/i)
  })
})

describe('LoadingOverlay rendering', () => {
  it('uses the name when given', () => {
    render(<LoadingOverlay subjectName="Bella" />)
    expect(screen.getByTestId('loading-line').textContent).toContain('Bella')
  })

  it('falls back to the species noun when there is no name', () => {
    render(<LoadingOverlay />)
    expect(screen.getByTestId('loading-line').textContent).toMatch(/animal|dog/i)
  })

  it('advances through the stages', () => {
    render(<LoadingOverlay subjectName="Bella" />)
    const first = screen.getByTestId('loading-line').textContent
    act(() => { jest.advanceTimersByTime(2600 * 3) })
    expect(screen.getByTestId('loading-line').textContent).not.toBe(first)
  })

  it('stops at the last stage rather than running off the end', () => {
    render(<LoadingOverlay />)
    act(() => { jest.advanceTimersByTime(2600 * 20) })
    expect(screen.getByTestId('loading-line')).toBeInTheDocument()
  })
})
