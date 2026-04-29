'use client'

import { ChallengeCard } from './ChallengeCard'

interface Challenge {
  id:           number | string
  emoji:        string
  title:        string
  desc:         string
  participants: number
  pct:          number
  duration:     string
}

interface ChallengeTabProps {
  challenges: Challenge[]
}

/**
 * ChallengeTab — grid of active group savings challenges.
 */
export function ChallengeTab({ challenges }: ChallengeTabProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1rem',
    }}>
      {challenges.map((c) => (
        <ChallengeCard key={c.id} {...c} />
      ))}
    </div>
  )
}
