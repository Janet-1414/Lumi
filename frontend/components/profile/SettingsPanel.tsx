'use client'

// components/profile/SettingsPanel.tsx

import { useState } from 'react'

interface NotificationSetting {
  key:   string
  label: string
  desc:  string
}

const SETTINGS: NotificationSetting[] = [
  { key: 'spending_alerts',   label: 'Spending alerts',   desc: 'Get warned before you overspend' },
  { key: 'weekly_report',     label: 'Weekly AI report',  desc: 'Your financial summary every Monday' },
  { key: 'savings_reminders', label: 'Savings reminders', desc: 'Nudges to keep your streak alive' },
  { key: 'community_digest',  label: 'Community digest',  desc: 'Weekly wins from the community' },
]

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    spending_alerts:   true,
    weekly_report:     true,
    savings_reminders: true,
    community_digest:  false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }))

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Notification settings
      </h3>
      {SETTINGS.map((item) => (
        <div key={item.key} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
          </div>
          <button
            role="switch"
            aria-checked={settings[item.key as keyof typeof settings]}
            onClick={() => toggle(item.key as keyof typeof settings)}
            style={{
              width: 42, height: 24, borderRadius: 12,
              background: settings[item.key as keyof typeof settings] ? 'var(--teal)' : 'rgba(255,255,255,0.1)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.25s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: settings[item.key as keyof typeof settings] ? 21 : 3,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', transition: 'left 0.25s',
            }} />
          </button>
        </div>
      ))}
    </div>
  )
}
