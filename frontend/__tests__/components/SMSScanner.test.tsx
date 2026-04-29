/**
 * __tests__/components/SMSScanner.test.tsx
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { SMSScanner } from '@/components/transactions/SMSScanner'

// Mock fetch globally
global.fetch = jest.fn()

describe('SMSScanner', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the scanner banner by default', () => {
    render(<SMSScanner />)
    expect(screen.getByText(/MTN MoMo SMS Scanner/i)).toBeInTheDocument()
  })

  it('shows "Try it" CTA on the banner', () => {
    render(<SMSScanner />)
    expect(screen.getByText(/Try it/i)).toBeInTheDocument()
  })

  it('expands the scanner panel when banner is clicked', () => {
    render(<SMSScanner />)
    fireEvent.click(screen.getByText(/Try it/i))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('shows example SMS pills', () => {
    render(<SMSScanner />)
    fireEvent.click(screen.getByText(/Try it/i))
    expect(screen.getByText('Example 1')).toBeInTheDocument()
  })

  it('fills textarea when example pill clicked', () => {
    render(<SMSScanner />)
    fireEvent.click(screen.getByText(/Try it/i))
    fireEvent.click(screen.getByText('Example 1'))
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value.length).toBeGreaterThan(10)
  })

  it('shows error when scan button clicked with empty input', () => {
    render(<SMSScanner />)
    fireEvent.click(screen.getByText(/Try it/i))
    fireEvent.click(screen.getByText(/Scan message/i))
    expect(screen.getByText(/paste your SMS/i)).toBeInTheDocument()
  })

  it('collapses when close button clicked', () => {
    render(<SMSScanner />)
    fireEvent.click(screen.getByText(/Try it/i))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/close/i))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
