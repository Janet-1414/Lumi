/**
 * types/community.types.ts — Community feature TypeScript types
 */

export interface CommunityPost {
  id:         string
  alias:      string       // anonymous — never real name
  message:    string       // no money amounts allowed
  emoji:      string
  likes:      number
  created_at: string
}

export interface GroupChallenge {
  id:           string
  title:        string
  description:  string
  emoji:        string
  participants: number
  progress_pct: number     // collective % — never actual amounts
  duration:     string
  joined:       boolean
}

export interface LeaderboardEntry {
  rank:         number
  alias:        string     // anonymous username
  progress_pct: number     // % of savings goal — NEVER actual amount
  badge_tier:   string
  is_you:       boolean
}

export interface WeeklyPulse {
  headline:        string  // e.g. "Lumi users saved UGX 124M this week"
  total_saved_ugx: number  // aggregate only — safe to show
  active_savers:   number
  top_category:    string
  generated_at:    string
}

export interface CommunityTip {
  id:         string
  alias:      string
  tip:        string
  likes:      number
  created_at: string
}
