'use client'

import React, { useState } from 'react'
import { formatCurrency, formatDate, formatPercent } from '@/lib/formatters'

interface Goal {
  id:             string
  name:           string
  target_amount:  number
  current_amount: number
  currency:       string
  deadline:       string | null
  emoji:          string
  is_completed:   boolean
  progress_pct:   number
  remaining:      number
}

interface GoalCardProps {
  goal:        Goal
  onDeposit?:  (goalId: string, amount: number) => Promise<void>
  onDelete?:   (goalId: string) => Promise<void>
}

/**
 * GoalCard — displays a single savings goal with animated progress bar,
 * deposit button, and deadline indicator.
 */
export function GoalCard({ goal, onDeposit, onDelete }: GoalCardProps) {
  const [depositing,    setDepositing]    = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [showInput,     setShowInput]     = useState(false)
  const [loading,       setLoading]       = useState(false)

  const pct = Math.min(goal.progress_pct, 100)

  // Color based on progress
  const barColor =
    pct >= 100 ? '#1D9E75' :
    pct >= 60  ? '#FAC775' :
    pct >= 30  ? '#EF9F27' :
                 '#5DCAA5'

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount.replace(/,/g, ''))
    if (!amount || amount <= 0 || !onDeposit) return
    setLoading(true)
    await onDeposit(goal.id, amount)
    setLoading(false)
    setShowInput(false)
    setDepositAmount('')
  }

  return (
    <div className={`goal-card ${goal.is_completed ? 'goal-card--done' : ''}`}>
      {/* Header */}
      <div className="goal-header">
        <div className="goal-emoji-wrap">
          <span className="goal-emoji">{goal.emoji}</span>
        </div>
        <div className="goal-meta">
          <div className="goal-name">{goal.name}</div>
          {goal.deadline && (
            <div className="goal-deadline">
              📅 {formatDate(goal.deadline)}
            </div>
          )}
        </div>
        <div className="goal-pct" style={{ color: barColor }}>
          {formatPercent(pct, 0)}
        </div>
      </div>

      {/* Amounts */}
      <div className="goal-amounts">
        <span className="goal-saved" style={{ color: barColor }}>
          {formatCurrency(goal.current_amount, goal.currency, true)}
        </span>
        <span className="goal-of">of</span>
        <span className="goal-target">
          {formatCurrency(goal.target_amount, goal.currency, true)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="goal-bar-bg">
        <div
          className="goal-bar-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {/* Remaining */}
      {!goal.is_completed && (
        <div className="goal-remaining">
          {formatCurrency(goal.remaining, goal.currency, true)} remaining
        </div>
      )}

      {/* Completed badge */}
      {goal.is_completed && (
        <div className="goal-completed-badge">🎉 Goal reached!</div>
      )}

      {/* Deposit UI */}
      {!goal.is_completed && (
        <div className="goal-actions">
          {showInput ? (
            <div className="deposit-row">
              <input
                className="deposit-input"
                type="number"
                placeholder="Amount (UGX)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeposit()}
                autoFocus
              />
              <button
                className="deposit-confirm"
                onClick={handleDeposit}
                disabled={loading}
              >
                {loading ? '…' : '✓'}
              </button>
              <button
                className="deposit-cancel"
                onClick={() => { setShowInput(false); setDepositAmount('') }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className="deposit-btn"
              onClick={() => setShowInput(true)}
            >
              + Add savings
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .goal-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .goal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .goal-card--done {
          border-color: rgba(29,158,117,0.3);
          background: linear-gradient(135deg, var(--bg-card), rgba(29,158,117,0.04));
        }

        .goal-header {
          display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px;
        }
        .goal-emoji-wrap {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(250,199,117,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 20px;
        }
        .goal-meta { flex: 1; min-width: 0; }
        .goal-name {
          font-size: 14px; font-weight: 600; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .goal-deadline { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }
        .goal-pct {
          font-family: var(--font-head);
          font-size: 18px; font-weight: 700; flex-shrink: 0;
        }

        .goal-amounts {
          display: flex; align-items: baseline; gap: 5px; margin-bottom: 8px;
        }
        .goal-saved {
          font-family: var(--font-head); font-size: 16px; font-weight: 700;
        }
        .goal-of { font-size: 12px; color: var(--text-muted); }
        .goal-target { font-size: 13px; color: var(--text-secondary); }

        .goal-bar-bg {
          height: 6px; background: rgba(255,255,255,0.07);
          border-radius: 3px; overflow: hidden; margin-bottom: 6px;
        }
        .goal-bar-fill {
          height: 100%; border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .goal-remaining {
          font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px;
        }
        .goal-completed-badge {
          font-size: 12.5px; font-weight: 600; color: var(--teal);
          background: rgba(29,158,117,0.1); border-radius: 6px;
          padding: 4px 10px; display: inline-block; margin-bottom: 10px;
        }

        /* Deposit */
        .goal-actions { display: flex; }
        .deposit-btn {
          width: 100%; padding: 8px;
          background: rgba(250,199,117,0.08);
          border: 1px dashed rgba(250,199,117,0.3);
          border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px;
          color: var(--gold); cursor: pointer;
          transition: all 0.2s;
        }
        .deposit-btn:hover {
          background: rgba(250,199,117,0.15);
          border-style: solid;
        }

        .deposit-row {
          display: flex; gap: 6px; width: 100%; align-items: center;
        }
        .deposit-input {
          flex: 1; background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 7px 10px; font-family: var(--font-body);
          font-size: 13px; color: var(--text-primary); outline: none;
          transition: border-color 0.2s;
        }
        .deposit-input:focus { border-color: var(--border-focus); }
        .deposit-confirm, .deposit-cancel {
          width: 30px; height: 30px; border-radius: 6px;
          border: none; cursor: pointer; font-size: 13px;
          transition: background 0.15s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .deposit-confirm {
          background: rgba(29,158,117,0.2); color: var(--teal);
        }
        .deposit-confirm:hover { background: rgba(29,158,117,0.35); }
        .deposit-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
        .deposit-cancel {
          background: rgba(255,255,255,0.05); color: var(--text-muted);
        }
        .deposit-cancel:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}
