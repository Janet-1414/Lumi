'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { LumiAvatar } from '@/components/chat/LumiAvatar'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { SuggestedChips } from '@/components/chat/SuggestedChips'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

// ─── Suggested prompts (mirror backend) ──────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { label: '💸 Where did my money go?',    text: 'Where did most of my money go this month?' },
  { label: '🎯 Savings progress',          text: 'How am I doing on my savings goals?' },
  { label: '📊 Am I overspending?',        text: 'Am I overspending in any category?' },
  { label: '💡 How can I save more?',      text: 'Give me 3 practical ways to save more money this month.' },
  { label: '📈 My financial health',       text: 'Give me an honest summary of my financial health.' },
  { label: '🍔 Food spending',             text: 'How much am I spending on food and can I reduce it?' },
]

// ─── Chat Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const abortRef    = useRef<AbortController | null>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ────────────────────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return

    const userMsg: Message = {
      id:      `u-${Date.now()}`,
      role:    'user',
      content: text.trim(),
    }

    // Optimistic update
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    // Placeholder assistant message — will fill as chunks arrive
    const assistantId = `a-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
      abortRef.current = new AbortController()

      const res = await fetch(`${apiUrl}/chat/stream`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          message:    text.trim(),
          session_id: sessionId,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value)
        const lines = raw.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const chunk = line.replace('data: ', '')
          if (chunk === '[DONE]') break

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m,
            ),
          )
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      // Fallback: show error in chat
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I had trouble connecting. Please try again.' }
            : m,
        ),
      )
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleChipSelect = (text: string) => {
    setInput(text)
    sendMessage(text)
  }

  const stopStreaming = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  const clearChat = () => {
    if (streaming) stopStreaming()
    setMessages([])
    setSessionId(null)
  }

  const isEmpty = messages.length === 0

  return (
    <AppShell userName="Akosua">
      <div className="chat-page">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="chat-header">
          <LumiAvatar size="md" thinking={streaming} />
          <div>
            <div className="chat-title">Chat with Lumi AI</div>
            <div className="chat-status">
              {streaming
                ? '✨ Lumi is thinking…'
                : 'Powered by LangGraph · GPT-4o-mini'}
            </div>
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat}>
              Clear chat
            </button>
          )}
        </div>

        {/* ── Messages area ────────────────────────────────────────── */}
        <div className="chat-body">
          {/* Empty state */}
          {isEmpty && (
            <div className="chat-empty">
              <div className="empty-avatar">
                <LumiAvatar size="lg" />
              </div>
              <h2 className="empty-title">Hey Akosua! 👋</h2>
              <p className="empty-sub">
                I know your finances inside out. Ask me anything — where your
                money went, how to save more, or how to hit your goals faster.
              </p>
              <SuggestedChips
                prompts={SUGGESTED_PROMPTS}
                onSelect={handleChipSelect}
              />
            </div>
          )}

          {/* Messages */}
          <div className="messages-list">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                streaming={
                  streaming &&
                  i === messages.length - 1 &&
                  msg.role === 'assistant'
                }
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input area ───────────────────────────────────────────── */}
        <div className="chat-input-wrap">
          {/* Quick chips when chat has messages */}
          {!isEmpty && !streaming && (
            <div className="quick-chips">
              {SUGGESTED_PROMPTS.slice(0, 3).map((p) => (
                <button
                  key={p.text}
                  className="quick-chip"
                  onClick={() => handleChipSelect(p.text)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <div className="input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask Lumi anything about your money…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={streaming}
              aria-label="Chat message input"
            />
            {streaming ? (
              <button
                className="send-btn send-btn--stop"
                onClick={stopStreaming}
                aria-label="Stop generating"
              >
                ⏹
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                aria-label="Send message"
              >
                ↑
              </button>
            )}
          </div>
          <p className="input-hint">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>

      </div>

      <style jsx>{`
        .chat-page {
          display: flex; flex-direction: column;
          height: calc(100vh - 80px);
          padding-top: 1rem;
          gap: 0;
        }

        /* Header */
        .chat-header {
          display: flex; align-items: center; gap: 12px;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0;
          flex-shrink: 0;
        }
        .chat-title {
          font-family: var(--font-head); font-size: 16px; font-weight: 700;
          color: var(--text-primary);
        }
        .chat-status { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
        .clear-btn {
          margin-left: auto;
          background: none; border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 5px 12px;
          font-family: var(--font-body); font-size: 12px;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.2s;
        }
        .clear-btn:hover { border-color: var(--red); color: var(--red); }

        /* Body */
        .chat-body {
          flex: 1; overflow-y: auto; padding: 1.25rem 0;
          scrollbar-width: thin;
        }

        /* Empty state */
        .chat-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 2rem 1rem; text-align: center;
        }
        .empty-avatar { margin-bottom: 1rem; }
        .empty-title {
          font-family: var(--font-head); font-size: 20px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 8px;
        }
        .empty-sub {
          font-size: 13.5px; color: var(--text-secondary);
          max-width: 380px; line-height: 1.65; margin-bottom: 1.5rem;
        }

        /* Messages */
        .messages-list {
          display: flex; flex-direction: column; gap: 12px; padding: 0 4px;
        }

        /* Input */
        .chat-input-wrap {
          flex-shrink: 0; padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .quick-chips {
          display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;
        }
        .quick-chip {
          padding: 5px 11px;
          background: rgba(250,199,117,0.06);
          border: 1px solid rgba(250,199,117,0.18);
          border-radius: var(--radius-full);
          font-family: var(--font-body); font-size: 11.5px;
          color: var(--text-secondary); cursor: pointer;
          transition: all 0.18s;
        }
        .quick-chip:hover {
          background: rgba(250,199,117,0.14);
          border-color: rgba(250,199,117,0.4);
          color: var(--gold);
        }

        .input-row {
          display: flex; gap: 8px; align-items: flex-end;
        }
        .chat-input {
          flex: 1; min-height: 44px; max-height: 120px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 12px; padding: 11px 14px;
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-primary); resize: none; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          line-height: 1.5;
        }
        .chat-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--gold-glow-sm);
        }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-input:disabled { opacity: 0.5; }

        .send-btn {
          width: 44px; height: 44px; border-radius: 11px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; cursor: pointer; font-size: 18px;
          color: #1a0f00; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .send-btn--stop {
          background: rgba(216,90,48,0.2);
          color: var(--red); font-size: 14px;
        }
        .send-btn--stop:hover { background: rgba(216,90,48,0.35) !important; }

        .input-hint {
          font-size: 11px; color: var(--text-muted);
          text-align: center; margin-top: 6px;
        }
      `}</style>
    </AppShell>
  )
}
