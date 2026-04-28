'use client'
/**
 * hooks/useChat.ts — Chat state management extracted from chat/page.tsx
 */
import { useCallback, useRef, useState } from 'react'

export interface ChatMessage {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

interface UseChatReturn {
  messages:      ChatMessage[]
  streaming:     boolean
  sessionId:     string | null
  sendMessage:   (text: string) => Promise<void>
  stopStreaming:  () => void
  clearChat:     () => void
}

export function useChat(): UseChatReturn {
  const [messages,  setMessages]  = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text.trim() }
    const assistantId = `a-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ])
    setStreaming(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
      abortRef.current = new AbortController()

      const res = await fetch(`${apiUrl}/chat/stream`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ message: text.trim(), session_id: sessionId }),
        signal:      abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const raw   = decoder.decode(value)
        const lines = raw.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          const chunk = line.replace('data: ', '')
          if (chunk === '[DONE]') break
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m,
            ),
          )
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
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
  }, [streaming, sessionId])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
  }, [])

  const clearChat = useCallback(() => {
    if (streaming) stopStreaming()
    setMessages([])
    setSessionId(null)
  }, [streaming, stopStreaming])

  return { messages, streaming, sessionId, sendMessage, stopStreaming, clearChat }
}
