/**
 * __tests__/components/StatCard.test.tsx
 */

import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/dashboard/StatCard'

describe('StatCard', () => {
  const defaultProps = {
    label:  'Total Balance',
    value:  2_450_000,
    icon:   '💰',
    accent: 'gold' as const,
  }

  it('renders the label', () => {
    render(<StatCard {...defaultProps} />)
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
  })

  it('renders formatted UGX value', () => {
    render(<StatCard {...defaultProps} />)
    expect(screen.getByText(/2,450,000/)).toBeInTheDocument()
  })

  it('renders the icon emoji', () => {
    render(<StatCard {...defaultProps} />)
    expect(screen.getByText('💰')).toBeInTheDocument()
  })

  it('shows positive change badge with + prefix', () => {
    render(<StatCard {...defaultProps} changePct={8.4} />)
    expect(screen.getByText('+8.4%')).toBeInTheDocument()
  })

  it('shows negative change badge without + prefix', () => {
    render(<StatCard {...defaultProps} changePct={-3.1} />)
    expect(screen.getByText('-3.1%')).toBeInTheDocument()
  })

  it('does not render change badge when changePct is undefined', () => {
    render(<StatCard {...defaultProps} />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
