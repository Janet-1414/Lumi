'use client'

import React from 'react'
import { LumiAvatar } from './LumiAvatar'

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

interface MessageBubbleProps {
  message:   Message
  streaming?: boolean    // true while content is still arriving
}

/**
 * MessageBubble — renders a single chat message.
 * User messages: right-aligned gold bubble.
 * Assistant messages: left-aligned dark bubble with Lumi avatar.
 * Streaming assistant messages show a pulsing cursor at the end.
 */
export function MessageBubble({ message, streaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`bubble-wrap ${isUser ? 'bubble-wrap--user' : 'bubble-wrap--assistant'}`}>
      {!isUser && <LumiAvatar size="sm" thinking={streaming} />}

      <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}>
        {/* Simple line-break rendering — no heavy markdown lib needed */}
        {message.content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < message.content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
        {streaming && <span className="cursor" aria-hidden="true" />}
      </div>

      <style jsx>{`
        .bubble-wrap {
          display: flex; align-items: flex-end; gap: 8px;
          max-width: 80%;
          animation: fadeUp 0.2s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bubble-wrap--user      { align-self: flex-end; flex-direction: row-reverse; }
        .bubble-wrap--assistant { align-self: flex-start; }

        .bubble {
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13.5px; line-height: 1.65;
          max-width: 100%;
          word-break: break-word;
        }

        .bubble--user {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          color: #1a0f00;
          border-bottom-right-radius: 4px;
        }

        .bubble--assistant {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .cursor {
          display: inline-block;
          width: 2px; height: 14px;
          background: var(--gold);
          margin-left: 2px;
          vertical-align: text-bottom;
          border-radius: 1px;
          animation: blink 0.8s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}
