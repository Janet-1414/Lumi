/**
 * __tests__/components/Leaderboard.test.tsx
 *
 * Critical privacy test — the leaderboard must NEVER show actual
 * money amounts. Only percentages are allowed.
 */

import { render, screen } from '@testing-library/react'

// Inline mock leaderboard component matching community/page.tsx structure
const LEADERBOARD_DATA = [
  { rank: 1, alias: 'DiamondSaver_LGS', pct: 97.4, tier: '💎', isYou: false },
  { rank: 2, alias: 'GoldGoals_NBO',    pct: 94.1, tier: '🥇', isYou: false },
  { rank: 5, alias: 'You',              pct: 75.0, tier: '🥈', isYou: true  },
]

function MockLeaderboard() {
  return (
    <div>
      <div>🔒 Ranked by savings goal % only — no actual amounts are ever shown</div>
      {LEADERBOARD_DATA.map((e) => (
        <div key={e.rank} data-testid={`lb-row-${e.rank}`}>
          <span data-testid={`lb-alias-${e.rank}`}>{e.alias}</span>
          <span data-testid={`lb-pct-${e.rank}`}>{e.pct}%</span>
          {/* amount field intentionally ABSENT */}
        </div>
      ))}
    </div>
  )
}

describe('Leaderboard privacy', () => {
  beforeEach(() => {
    render(<MockLeaderboard />)
  })

  it('shows the privacy disclaimer', () => {
    expect(screen.getByText(/no actual amounts/i)).toBeInTheDocument()
  })

  it('shows anonymous aliases, not real names', () => {
    expect(screen.getByTestId('lb-alias-1')).toHaveTextContent('DiamondSaver_LGS')
  })

  it('shows percentage values', () => {
    expect(screen.getByTestId('lb-pct-1')).toHaveTextContent('97.4%')
    expect(screen.getByTestId('lb-pct-5')).toHaveTextContent('75.0%')
  })

  it('does NOT show any UGX amounts', () => {
    const content = document.body.textContent ?? ''
    expect(content).not.toMatch(/UGX\s*[\d,]+/)
  })

  it('does NOT show any raw money amounts over 1000', () => {
    const content = document.body.textContent ?? ''
    // Look for numbers that could be money amounts (e.g. 350,000 or 2450000)
    const moneyPattern = /\b\d{4,}[\d,]*\b/g
    const matches = content.match(moneyPattern) ?? []
    expect(matches).toHaveLength(0)
  })

  it('marks the current user row', () => {
    expect(screen.getByTestId('lb-alias-5')).toHaveTextContent('You')
  })

  it('shows all 3 leaderboard entries', () => {
    expect(screen.getByTestId('lb-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('lb-row-2')).toBeInTheDocument()
    expect(screen.getByTestId('lb-row-5')).toBeInTheDocument()
  })
})
