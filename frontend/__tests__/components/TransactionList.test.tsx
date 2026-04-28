/**
 * __tests__/components/TransactionList.test.tsx
 */

import { render, screen } from '@testing-library/react'
import { TransactionList } from '@/components/transactions/TransactionList'
import type { Transaction } from '@/types/dashboard.types'

const mockTransactions: Transaction[] = [
  {
    id:          't1',
    amount:      12_000,
    type:        'expense',
    category:    'food',
    description: 'Rolex from Wandegeya',
    date:        new Date().toISOString(),
    source:      'manual',
    currency:    'UGX',
    ai_scanned:  false,
    created_at:  new Date().toISOString(),
  },
  {
    id:          't2',
    amount:      350_000,
    type:        'income',
    category:    'income',
    description: 'MTN MoMo — Salary from Andela',
    date:        new Date().toISOString(),
    source:      'sms_scan',
    currency:    'UGX',
    ai_scanned:  true,
    created_at:  new Date().toISOString(),
  },
]

describe('TransactionList', () => {
  it('renders a list of transactions', () => {
    render(<TransactionList transactions={mockTransactions} />)
    expect(screen.getByText('Rolex from Wandegeya')).toBeInTheDocument()
    expect(screen.getByText('MTN MoMo — Salary from Andela')).toBeInTheDocument()
  })

  it('shows AI badge on ai_scanned transactions', () => {
    render(<TransactionList transactions={mockTransactions} />)
    expect(screen.getAllByText(/AI/).length).toBeGreaterThan(0)
  })

  it('shows empty state when no transactions', () => {
    render(<TransactionList transactions={[]} />)
    expect(screen.getByText(/No transactions/i)).toBeInTheDocument()
  })

  it('renders loading skeletons when loading is true', () => {
    const { container } = render(<TransactionList transactions={[]} loading />)
    // Skeleton divs should be present
    expect(container.querySelectorAll('[style*="animation"]').length).toBeGreaterThan(0)
  })

  it('income transactions show + prefix', () => {
    render(<TransactionList transactions={[mockTransactions[1]]} />)
    expect(screen.getByText(/\+/)).toBeInTheDocument()
  })

  it('expense transactions show - prefix', () => {
    render(<TransactionList transactions={[mockTransactions[0]]} />)
    expect(screen.getByText(/-/)).toBeInTheDocument()
  })
})
