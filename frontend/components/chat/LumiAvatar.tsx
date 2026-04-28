'use client'

import React from 'react'

interface LumiAvatarProps {
  size?:      'sm' | 'md' | 'lg'
  thinking?:  boolean
}

/**
 * LumiAvatar — the glowing 💡 avatar used in the chat interface.
 * Pulses when the AI is thinking/streaming.
 */
export function LumiAvatar({ size = 'md', thinking = false }: LumiAvatarProps) {
  const dims = { sm: 28, md: 36, lg: 48 }[size]
  const font = { sm: 14, md: 18, lg: 24 }[size]

  return (
    <div
      className={`lumi-av ${thinking ? 'lumi-av--thinking' : ''}`}
      style={{ width: dims, height: dims, borderRadius: dims / 3.5 }}
      aria-label="Lumi AI"
    >
      <span style={{ fontSize: font }}>💡</span>

      <style jsx>{`
        .lumi-av {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(250,199,117,0.4);
          transition: box-shadow 0.3s;
        }
        .lumi-av--thinking {
          animation: glow-pulse 1.2s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 10px rgba(250,199,117,0.4); }
          50%      { box-shadow: 0 0 24px rgba(250,199,117,0.8); }
        }
      `}</style>
    </div>
  )
}
