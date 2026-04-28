'use client'

import React, { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { GoalCard } from '@/components/savings/GoalCard'
import { StreakBanner } from '@/components/savings/StreakBanner'
import { formatCurrency } from '@/lib/formatters'
import { PLACEHOLDER_GOALS } from '@/lib/placeholder-data'

// ─── Placeholder AI challenge (polished UI) ───────────────────────────────────

const CHALLENGE = {
  title:       'Cook at Home Week 🍳',
  description: 'Cook all your meals at home for 7 days. The average Lumi user saves UGX 80,000 doing this!',
  target_save: 80_000,
  duration:    '7 days',
}

// ─── Add goal modal (simple inline form) ─────────────────────────────────────

function AddGoalModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd:   (g: { name: string; target: number; emoji: string }) => void
}) {
  const [name,   setName]   = useState('')
  const [target, setTarget] = useState('')
  const [emoji,  setEmoji]  = useState('🎯')

  const EMOJIS = ['🎯','🏠','💻','✈️','💍','🎓','🚗','📱','👶','💰']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New savings goal</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="emoji-row">
            {EMOJIS.map((e) => (
              <button
                key={e}
                className={`emoji-btn ${emoji === e ? 'emoji-btn--active' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="modal-field">
            <label>Goal name</label>
            <input
              className="modal-input"
              placeholder="e.g. Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>Target amount (UGX)</label>
            <input
              className="modal-input"
              type="number"
              placeholder="e.g. 2000000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <button
            className="modal-submit"
            onClick={() => {
              if (!name || !target) return
              onAdd({ name, target: parseFloat(target), emoji })
              onClose()
            }}
          >
            Create goal
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 1rem;
        }
        .modal {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 1.5rem;
          width: 100%; max-width: 400px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .modal-header h3 {
          font-family: var(--font-head); font-size: 17px; font-weight: 700;
        }
        .modal-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 16px;
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.06); }

        .emoji-row {
          display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 1rem;
        }
        .emoji-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg-input);
          font-size: 18px; cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .emoji-btn:hover, .emoji-btn--active {
          border-color: var(--gold); background: rgba(250,199,117,0.1);
        }

        .modal-field { margin-bottom: 1rem; }
        .modal-field label {
          display: block; font-size: 12px; color: var(--text-secondary);
          font-weight: 500; margin-bottom: 5px;
        }
        .modal-input {
          width: 100%; background: var(--bg-input);
          border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px; font-family: var(--font-body);
          font-size: 13.5px; color: var(--text-primary); outline: none;
          transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: var(--border-focus); }

        .modal-submit {
          width: 100%; padding: 11px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 14px; font-weight: 600;
          color: #1a0f00; cursor: pointer; margin-top: 0.5rem;
          transition: opacity 0.2s, transform 0.15s;
        }
        .modal-submit:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavingsPage() {
  const [goals, setGoals]         = useState(PLACEHOLDER_GOALS)
  const [showModal, setShowModal] = useState(false)
  const [challenge, setChallenge] = useState(CHALLENGE)

  const totalSaved    = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTargeted = goals.reduce((s, g) => s + g.target_amount,  0)
  const overallPct    = totalTargeted > 0 ? (totalSaved / totalTargeted * 100) : 0

  const handleDeposit = async (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, current_amount: g.current_amount + amount,
              progress_pct: Math.min((g.current_amount + amount) / g.target_amount * 100, 100) }
          : g,
      ),
    )
    // TODO: await apiClient.post(`/savings/${goalId}/deposit`, { amount })
  }

  const handleAdd = (data: { name: string; target: number; emoji: string }) => {
    const newGoal = {
      id:             `goal-${Date.now()}`,
      name:           data.name,
      target_amount:  data.target,
      current_amount: 0,
      currency:       'UGX',
      deadline:       null,
      emoji:          data.emoji,
      is_completed:   false,
      progress_pct:   0,
      remaining:      data.target,
    }
    setGoals((prev) => [newGoal, ...prev])
  }

  return (
    <AppShell userName="Akosua">
      {showModal && (
        <AddGoalModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}

      <div className="sav-page">

        {/* ── Streak banner ────────────────────────────────────────── */}
        <StreakBanner
          streakDays={14}
          badgeTier="silver"
          totalSaved={totalSaved}
        />

        {/* ── Overall progress ─────────────────────────────────────── */}
        <div className="overall-card">
          <div className="overall-row">
            <div>
              <div className="overall-label">Total saved</div>
              <div className="overall-val">
                {formatCurrency(totalSaved, 'UGX', true)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="overall-label">Total target</div>
              <div className="overall-val" style={{ color: 'var(--text-secondary)' }}>
                {formatCurrency(totalTargeted, 'UGX', true)}
              </div>
            </div>
          </div>
          <div className="overall-bar-bg">
            <div
              className="overall-bar-fill"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="overall-pct">{overallPct.toFixed(1)}% of all goals complete</div>
        </div>

        {/* ── Goals header + add button ─────────────────────────────── */}
        <div className="goals-header">
          <h2 className="goals-title">My Goals</h2>
          <button className="add-goal-btn" onClick={() => setShowModal(true)}>
            + New goal
          </button>
        </div>

        {/* ── Goals grid ───────────────────────────────────────────── */}
        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeposit={handleDeposit}
            />
          ))}
        </div>

        {/* ── AI Challenge (polished UI) ────────────────────────────── */}
        <div className="challenge-card">
          <div className="challenge-header">
            <div className="challenge-avatar">🤖</div>
            <div>
              <div className="challenge-from">Lumi AI Challenge</div>
              <div className="challenge-sub">Personalised for you</div>
            </div>
            <span className="challenge-duration">{challenge.duration}</span>
          </div>
          <div className="challenge-title">{challenge.title}</div>
          <div className="challenge-desc">{challenge.description}</div>
          <div className="challenge-save">
            Save up to {formatCurrency(challenge.target_save, 'UGX', true)}
          </div>
          <div className="challenge-btns">
            <button className="challenge-accept">Accept challenge 💪</button>
            <button className="challenge-skip">Skip for now</button>
          </div>
        </div>

        {/* ── Investment hint (polished UI — unlocks after discipline) ── */}
        <div className="invest-card">
          <div className="invest-lock">🔒</div>
          <div className="invest-content">
            <div className="invest-title">Investment Hints</div>
            <div className="invest-desc">
              Keep saving consistently for 30 days to unlock personalised
              Africa-relevant investment suggestions from Lumi AI.
            </div>
            <div className="invest-progress">
              <div className="invest-bar-bg">
                <div className="invest-bar-fill" style={{ width: '47%' }} />
              </div>
              <span className="invest-days">14 / 30 days</span>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .sav-page {
          display: flex; flex-direction: column; gap: 1.25rem;
          padding-top: 1.5rem;
        }

        /* Overall card */
        .overall-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .overall-row {
          display: flex; justify-content: space-between; margin-bottom: 10px;
        }
        .overall-label { font-size: 12px; color: var(--text-muted); margin-bottom: 2px; }
        .overall-val {
          font-family: var(--font-head); font-size: 20px; font-weight: 700;
          color: var(--gold);
        }
        .overall-bar-bg {
          height: 8px; background: rgba(255,255,255,0.06);
          border-radius: 4px; overflow: hidden; margin-bottom: 6px;
        }
        .overall-bar-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #1D9E75, #FAC775);
          transition: width 0.6s ease;
        }
        .overall-pct { font-size: 12px; color: var(--text-muted); }

        /* Goals header */
        .goals-header {
          display: flex; align-items: center; justify-content: space-between;
        }
        .goals-title {
          font-family: var(--font-head); font-size: 17px; font-weight: 700;
          color: var(--text-primary); margin: 0;
        }
        .add-goal-btn {
          padding: 7px 14px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px; font-weight: 600;
          color: #1a0f00; cursor: pointer; transition: opacity 0.2s, transform 0.15s;
        }
        .add-goal-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        /* Goals grid */
        .goals-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        /* AI Challenge card */
        .challenge-card {
          background: linear-gradient(135deg, rgba(250,199,117,0.07), rgba(29,158,117,0.04));
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .challenge-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
        }
        .challenge-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .challenge-from { font-size: 12px; font-weight: 600; color: var(--gold); }
        .challenge-sub  { font-size: 11px; color: var(--text-muted); }
        .challenge-duration {
          margin-left: auto; font-size: 11.5px; color: var(--teal);
          background: rgba(29,158,117,0.1); padding: 2px 8px; border-radius: 10px;
        }
        .challenge-title {
          font-size: 15px; font-weight: 700; color: var(--text-primary);
          margin-bottom: 5px;
        }
        .challenge-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
        .challenge-save {
          font-size: 13px; font-weight: 600; color: var(--teal);
          margin: 8px 0 12px;
        }
        .challenge-btns { display: flex; gap: 8px; }
        .challenge-accept {
          flex: 1; padding: 9px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px; font-weight: 600;
          color: #1a0f00; cursor: pointer; transition: opacity 0.2s;
        }
        .challenge-accept:hover { opacity: 0.9; }
        .challenge-skip {
          padding: 9px 16px;
          background: transparent; border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px; color: var(--text-muted);
          cursor: pointer; transition: all 0.2s;
        }
        .challenge-skip:hover { border-color: var(--border-focus); color: var(--text-secondary); }

        /* Investment hint */
        .invest-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem;
          display: flex; align-items: flex-start; gap: 14px;
          opacity: 0.7;
        }
        .invest-lock { font-size: 24px; margin-top: 2px; }
        .invest-title {
          font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;
        }
        .invest-desc { font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 10px; }
        .invest-progress { display: flex; align-items: center; gap: 10px; }
        .invest-bar-bg {
          flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;
        }
        .invest-bar-fill {
          height: 100%; border-radius: 3px; background: var(--gold);
          transition: width 0.6s ease;
        }
        .invest-days { font-size: 11.5px; color: var(--text-muted); white-space: nowrap; }

        @media (max-width: 600px) {
          .goals-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AppShell>
  )
}
