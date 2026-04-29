/**
 * types/ai.types.ts — AI feature TypeScript types
 */

import type { TransactionCategory, TransactionType } from './dashboard.types'

// ── SMS / Receipt Scanner ─────────────────────────────────────────────────────

export interface ScanRequest {
  text: string
}

export interface ScanPreview {
  amount:      number
  type:        TransactionType
  category:    TransactionCategory
  description: string
  date:        string
  currency:    string
  confidence:  number
  raw_text:    string
}

export type ScanStep = 'idle' | 'scanning' | 'preview' | 'saving' | 'success' | 'error'

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

export interface SuggestedPrompt {
  label: string
  text:  string
}

// ── AI Insight ────────────────────────────────────────────────────────────────

export type InsightType = 'tip' | 'warning' | 'celebration' | 'nudge'

export interface AIInsight {
  id:         string
  message:    string
  type:       InsightType
  created_at: string
}

// ── Money Personality ────────────────────────────────────────────────────────

export type MoneyPersonalityType = 'saver' | 'spender' | 'investor' | 'avoider' | 'planner'

export interface PersonalityResult {
  type:        MoneyPersonalityType
  label:       string
  description: string
  emoji:       string
  color:       string
}

export interface QuizQuestion {
  id:      string
  text:    string
  options: string[]
}
