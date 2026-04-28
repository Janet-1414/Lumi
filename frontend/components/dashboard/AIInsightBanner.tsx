'use client'

import React from 'react'
import type { AIInsight } from '@/types/dashboard.types'

interface AIInsightBannerProps {
  insight: AIInsight
  loading?: boolean
}

const TYPE_CONFIG = {
  tip:         { emoji: '💡', label: 'Lumi tip',         border: 'rgba(250,199,117,0.3)', bg: 'rgba(250,199,117,0.06)' },
  warning:     { emoji: '⚠️',  label: 'Heads up',         border: 'rgba(216,90,48,0.3)',   bg: 'rgba(216,90,48,0.05)'   },
  celebration: { emoji: '🎉', label: 'Celebrating you',  border: 'rgba(29,158,117,0.3)',  bg: 'rgba(29,158,117,0.05)'  },
  nudge:       { emoji: '👀', label: 'Just noticed',     border: 'rgba(175,169,236,0.3)', bg: 'rgba(175,169,236,0.05)' },
}

/**
 * AIInsightBanner — shows the AI-generated insight for the current user.
 * Glows gold for tips, teal for celebrations, red for warnings.
 */
export function AIInsightBanner({ insight, loading = false }: AIInsightBannerProps) {
  const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.tip

  if (loading) {
    return (
      <div className="insight-skeleton">
        <div className="skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton-line" style={{ width: '90%' }} />
        <div className="skeleton-line" style={{ width: '75%' }} />
        <style jsx>{`
          .insight-skeleton {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 1.25rem;
            display: flex; flex-direction: column; gap: 10px;
          }
          .skeleton-line {
            height: 12px; background: rgba(255,255,255,0.06);
            border-radius: 6px; animation: pulse 1.4s ease-in-out infinite;
          }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        `}</style>
      </div>
    )
  }

  return (
    <div
      className="insight-card"
      style={{ borderColor: config.border, background: config.bg }}
    >
      <div className="insight-header">
        <div className="insight-avatar">
          <span style={{ fontSize: 14 }}>💡</span>
        </div>
        <div className="insight-meta">
          <span className="insight-from">Lumi AI</span>
          <span className="insight-type">{config.label}</span>
        </div>
        <span className="insight-emoji">{config.emoji}</span>
      </div>

      <p className="insight-message">{insight.message}</p>

      <style jsx>{`
        .insight-card {
          border: 1px solid;
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: transform 0.2s;
        }
        .insight-card:hover { transform: translateY(-1px); }

        .insight-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 0.75rem;
        }
        .insight-avatar {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .insight-meta { flex: 1; }
        .insight-from {
          display: block;
          font-size: 12px; font-weight: 600;
          color: var(--gold);
        }
        .insight-type {
          font-size: 11px; color: var(--text-muted);
        }
        .insight-emoji { font-size: 20px; }

        .insight-message {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
