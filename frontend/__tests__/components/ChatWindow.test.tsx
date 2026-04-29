/**
 * __tests__/components/ChatWindow.test.tsx
 */

import { render, screen } from '@testing-library/react'
import { ChatWindow } from '@/components/chat/ChatWindow'

const PROMPTS = [
  { label: '💸 Where did my money go?', text: 'Where did my money go?' },
  { label: '🎯 Savings progress',        text: 'How are my savings?' },
]

describe('ChatWindow', () => {
  it('shows empty state with greeting when no messages', () => {
    render(
      <ChatWindow
        messages={[]}
        streaming={false}
        prompts={PROMPTS}
        onChipSelect={() => {}}
        userName="Akosua"
      />,
    )
    expect(screen.getByText(/Hey Akosua/i)).toBeInTheDocument()
  })

  it('shows suggested chips in empty state', () => {
    render(
      <ChatWindow
        messages={[]}
        streaming={false}
        prompts={PROMPTS}
        onChipSelect={() => {}}
      />,
    )
    expect(screen.getByText(/Where did my money go/i)).toBeInTheDocument()
  })

  it('renders user and assistant messages', () => {
    const messages = [
      { id: '1', role: 'user'      as const, content: 'What is my balance?' },
      { id: '2', role: 'assistant' as const, content: 'Your balance is UGX 2,450,000.' },
    ]
    render(
      <ChatWindow
        messages={messages}
        streaming={false}
        prompts={PROMPTS}
        onChipSelect={() => {}}
      />,
    )
    expect(screen.getByText('What is my balance?')).toBeInTheDocument()
    expect(screen.getByText('Your balance is UGX 2,450,000.')).toBeInTheDocument()
  })

  it('does NOT show empty state when messages exist', () => {
    const messages = [{ id: '1', role: 'user' as const, content: 'Hello' }]
    render(
      <ChatWindow
        messages={messages}
        streaming={false}
        prompts={PROMPTS}
        onChipSelect={() => {}}
      />,
    )
    expect(screen.queryByText(/Hey Akosua/i)).not.toBeInTheDocument()
  })

  it('calls onChipSelect when a suggested chip is clicked', () => {
    const onChipSelect = jest.fn()
    render(
      <ChatWindow
        messages={[]}
        streaming={false}
        prompts={PROMPTS}
        onChipSelect={onChipSelect}
      />,
    )
    screen.getByText(/Where did my money go/i).click()
    expect(onChipSelect).toHaveBeenCalledWith('Where did my money go?')
  })
})
