/**
 * __tests__/components/GoalCard.test.tsx
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { GoalCard } from '@/components/savings/GoalCard'

const baseGoal = {
  id:             'goal-1',
  name:           'Emergency Fund',
  target_amount:  3_000_000,
  current_amount: 1_840_000,
  currency:       'UGX',
  deadline:       null,
  emoji:          '🏦',
  is_completed:   false,
  progress_pct:   61.3,
  remaining:      1_160_000,
}

describe('GoalCard', () => {
  it('renders the goal name', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('Emergency Fund')).toBeInTheDocument()
  })

  it('renders the progress percentage', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('61%')).toBeInTheDocument()
  })

  it('renders the emoji', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('🏦')).toBeInTheDocument()
  })

  it('shows remaining amount', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText(/remaining/i)).toBeInTheDocument()
  })

  it('shows Add savings button when not completed', () => {
    render(<GoalCard goal={baseGoal} onDeposit={async () => {}} />)
    expect(screen.getByText(/Add savings/i)).toBeInTheDocument()
  })

  it('shows deposit input when Add savings is clicked', () => {
    render(<GoalCard goal={baseGoal} onDeposit={async () => {}} />)
    fireEvent.click(screen.getByText(/Add savings/i))
    expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument()
  })

  it('shows completed badge when is_completed is true', () => {
    const completedGoal = { ...baseGoal, is_completed: true, progress_pct: 100 }
    render(<GoalCard goal={completedGoal} />)
    expect(screen.getByText(/Goal reached/i)).toBeInTheDocument()
  })

  it('does NOT show Add savings button when completed', () => {
    const completedGoal = { ...baseGoal, is_completed: true }
    render(<GoalCard goal={completedGoal} />)
    expect(screen.queryByText(/Add savings/i)).not.toBeInTheDocument()
  })

  it('calls onDeposit with the entered amount', async () => {
    const onDeposit = jest.fn().mockResolvedValue(undefined)
    render(<GoalCard goal={baseGoal} onDeposit={onDeposit} />)

    fireEvent.click(screen.getByText(/Add savings/i))
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), { target: { value: '50000' } })
    fireEvent.click(screen.getByText('✓'))

    expect(onDeposit).toHaveBeenCalledWith('goal-1', 50_000)
  })
})
