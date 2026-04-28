'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency } from '@/lib/formatters'

// ─── Placeholder data ─────────────────────────────────────────────────────────

const PERSONALITY = {
  type:  'Planner',
  emoji: '📋',
  desc:  'You love structure and forecasting. You set goals, track progress obsessively, and rarely make impulse purchases. Your superpower is discipline.',
  color: '#AFA9EC',
}

const BADGES = [
  { name: "First Step",     emoji: "👣", tier: "bronze",  unlocked: true,  desc: "Logged your first transaction" },
  { name: "Week Warrior",   emoji: "🔥", tier: "bronze",  unlocked: true,  desc: "7-day saving streak" },
  { name: "SMS Scanner",    emoji: "📱", tier: "bronze",  unlocked: true,  desc: "Scanned your first MoMo SMS" },
  { name: "Goal Setter",    emoji: "🎯", tier: "bronze",  unlocked: true,  desc: "Created your first savings goal" },
  { name: "Fortnight Fire", emoji: "💫", tier: "silver",  unlocked: true,  desc: "14-day saving streak" },
  { name: "Budget Boss",    emoji: "💼", tier: "silver",  unlocked: false, desc: "Stay under budget for a month" },
  { name: "Goal Crusher",   emoji: "🏆", tier: "gold",    unlocked: false, desc: "Complete a savings goal" },
  { name: "AI Whisperer",   emoji: "🤖", tier: "gold",    unlocked: false, desc: "10 AI chat sessions" },
  { name: "Diamond Saver",  emoji: "💎", tier: "diamond", unlocked: false, desc: "100-day saving streak" },
]

const STATS = [
  { label: "Transactions",    value: "47",        icon: "💳" },
  { label: "Total Saved",     value: "UGX 2.9M",  icon: "💰" },
  { label: "Saving Streak",   value: "14 days",   icon: "🔥" },
  { label: "Goals Completed", value: "1",         icon: "🎯" },
  { label: "AI Scans Done",   value: "12",        icon: "✨" },
  { label: "Member Since",    value: "Jan 2025",  icon: "📅" },
]

const TIER_COLORS: Record<string, string> = {
  bronze:  '#CD7F32',
  silver:  '#C0C0C0',
  gold:    '#FAC775',
  diamond: '#85B7EB',
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel() {
  const [settings, setSettings] = useState({
    spending_alerts:   true,
    weekly_report:     true,
    savings_reminders: true,
    community_digest:  false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }))

  const ITEMS = [
    { key: 'spending_alerts',   label: 'Spending alerts',   desc: 'Get warned before you overspend' },
    { key: 'weekly_report',     label: 'Weekly AI report',  desc: 'Your financial summary every Monday' },
    { key: 'savings_reminders', label: 'Savings reminders', desc: 'Nudges to keep your streak alive' },
    { key: 'community_digest',  label: 'Community digest',  desc: 'Weekly wins from the community' },
  ] as const

  return (
    <div className="settings-panel">
      <h3 className="settings-title">Notification settings</h3>
      {ITEMS.map(item => (
        <div key={item.key} className="settings-row">
          <div className="settings-info">
            <div className="settings-label">{item.label}</div>
            <div className="settings-desc">{item.desc}</div>
          </div>
          <button
            className={`toggle ${settings[item.key] ? 'toggle--on' : ''}`}
            onClick={() => toggle(item.key)}
            role="switch"
            aria-checked={settings[item.key]}
          >
            <div className="toggle-thumb" />
          </button>
        </div>
      ))}
      <style jsx>{`
        .settings-panel { display: flex; flex-direction: column; gap: 4px; }
        .settings-title {
          font-family: var(--font-head); font-size: 14px; font-weight: 600;
          color: var(--text-primary); margin-bottom: 8px;
        }
        .settings-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 10px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-label { font-size: 13.5px; font-weight: 500; color: var(--text-primary); }
        .settings-desc  { font-size: 11.5px; color: var(--text-muted); margin-top: 1px; }
        .toggle {
          width: 42px; height: 24px; border-radius: 12px;
          background: rgba(255,255,255,0.1); border: none; cursor: pointer;
          position: relative; flex-shrink: 0; transition: background 0.25s;
        }
        .toggle--on { background: var(--teal); }
        .toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: transform 0.25s;
        }
        .toggle--on .toggle-thumb { transform: translateX(18px); }
      `}</style>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null)

  return (
    <AppShell userName="Akosua">
      <div className="prof-page">

        {/* Hero */}
        <div className="prof-hero">
          <div className="prof-avatar">A</div>
          <div className="prof-info">
            <div className="prof-name">Akosua Mensah</div>
            <div className="prof-email">akosua@example.com</div>
            <div className="prof-since">Member since January 2025</div>
          </div>
          <button className="edit-btn">Edit profile</button>
        </div>

        {/* Money Personality */}
        <div className="personality-card" style={{ borderColor: `${PERSONALITY.color}40` }}>
          <div className="personality-header">
            <div className="personality-icon" style={{ background: `${PERSONALITY.color}20` }}>
              <span style={{ fontSize: 22 }}>{PERSONALITY.emoji}</span>
            </div>
            <div>
              <div className="personality-label">Money Personality</div>
              <div className="personality-type" style={{ color: PERSONALITY.color }}>
                The {PERSONALITY.type}
              </div>
            </div>
          </div>
          <p className="personality-desc">{PERSONALITY.desc}</p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-tile">
              <div className="stat-tile-icon">{s.icon}</div>
              <div className="stat-tile-val">{s.value}</div>
              <div className="stat-tile-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badge collection */}
        <div className="card">
          <h2 className="card-title">Badge collection</h2>
          <p className="card-sub">
            {BADGES.filter(b => b.unlocked).length} of {BADGES.length} unlocked
          </p>
          <div className="badge-grid">
            {BADGES.map((b, i) => (
              <div
                key={b.name}
                className={`badge-tile ${b.unlocked ? 'badge-tile--unlocked' : 'badge-tile--locked'}`}
                style={b.unlocked ? { borderColor: `${TIER_COLORS[b.tier]}40` } : {}}
                onMouseEnter={() => setHoveredBadge(i)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div
                  className="badge-emoji"
                  style={b.unlocked ? { filter: 'none' } : { filter: 'grayscale(1) opacity(0.3)' }}
                >
                  {b.emoji}
                </div>
                <div
                  className="badge-name"
                  style={{ color: b.unlocked ? TIER_COLORS[b.tier] : 'var(--text-muted)' }}
                >
                  {b.name}
                </div>
                {hoveredBadge === i && (
                  <div className="badge-tooltip">
                    <div className="tooltip-tier" style={{ color: TIER_COLORS[b.tier] }}>
                      {b.tier.toUpperCase()}
                    </div>
                    <div className="tooltip-desc">{b.desc}</div>
                    {!b.unlocked && <div className="tooltip-locked">🔒 Not yet unlocked</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="card">
          <SettingsPanel />
        </div>

        {/* Danger zone */}
        <div className="danger-card">
          <div className="danger-title">Account</div>
          <div className="danger-actions">
            <button className="danger-btn danger-btn--warn">Export my data</button>
            <button className="danger-btn danger-btn--red">Delete account</button>
          </div>
        </div>

      </div>

      <style jsx>{`
        .prof-page { display: flex; flex-direction: column; gap: 1.25rem; padding-top: 1.5rem; }

        /* Hero */
        .prof-hero {
          display: flex; align-items: center; gap: 14px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .prof-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-head); font-size: 22px; font-weight: 700;
          color: #1a0f00; flex-shrink: 0;
        }
        .prof-name  { font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .prof-email { font-size: 12.5px; color: var(--text-secondary); margin-top: 2px; }
        .prof-since { font-size: 11.5px; color: var(--text-muted); margin-top: 1px; }
        .edit-btn {
          margin-left: auto; padding: 7px 14px;
          background: transparent; border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px; color: var(--text-secondary);
          cursor: pointer; flex-shrink: 0; transition: all 0.2s;
        }
        .edit-btn:hover { border-color: var(--gold); color: var(--gold); }

        /* Personality */
        .personality-card {
          background: var(--bg-card); border: 1px solid;
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .personality-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .personality-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .personality-label { font-size: 11.5px; color: var(--text-muted); margin-bottom: 2px; }
        .personality-type  { font-family: var(--font-head); font-size: 16px; font-weight: 700; }
        .personality-desc  { font-size: 13px; color: var(--text-secondary); line-height: 1.65; }

        /* Stats */
        .stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        .stat-tile {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 1rem;
          text-align: center;
        }
        .stat-tile-icon { font-size: 20px; margin-bottom: 6px; }
        .stat-tile-val  { font-family: var(--font-head); font-size: 16px; font-weight: 700; color: var(--gold); }
        .stat-tile-lbl  { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

        /* Card */
        .card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .card-title { font-family: var(--font-head); font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
        .card-sub   { font-size: 12px; color: var(--text-muted); margin: 0 0 1rem; }

        /* Badge grid */
        .badge-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px;
        }
        .badge-tile {
          border: 1px solid var(--border); border-radius: 12px;
          padding: 12px 8px; text-align: center; cursor: pointer;
          transition: transform 0.15s, border-color 0.2s;
          position: relative;
        }
        .badge-tile:hover { transform: translateY(-2px); }
        .badge-tile--unlocked { background: rgba(255,255,255,0.02); }
        .badge-tile--locked   { background: rgba(255,255,255,0.01); }
        .badge-emoji { font-size: 24px; display: block; margin-bottom: 5px; }
        .badge-name  { font-size: 10.5px; font-weight: 600; }
        .badge-tooltip {
          position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%);
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 10px; z-index: 10;
          white-space: nowrap; text-align: left;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        .tooltip-tier { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
        .tooltip-desc { font-size: 11.5px; color: var(--text-secondary); margin-top: 2px; }
        .tooltip-locked { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

        /* Danger */
        .danger-card {
          background: var(--bg-card); border: 1px solid rgba(216,90,48,0.2);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .danger-title { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; }
        .danger-actions { display: flex; gap: 8px; }
        .danger-btn {
          padding: 8px 16px; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13px; cursor: pointer;
          transition: all 0.2s;
        }
        .danger-btn--warn {
          background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
        }
        .danger-btn--warn:hover { border-color: var(--gold); color: var(--gold); }
        .danger-btn--red {
          background: rgba(216,90,48,0.1); border: 1px solid rgba(216,90,48,0.3); color: var(--red);
        }
        .danger-btn--red:hover { background: rgba(216,90,48,0.2); }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .prof-hero   { flex-wrap: wrap; }
          .edit-btn    { margin-left: 0; }
        }
      `}</style>
    </AppShell>
  )
}
