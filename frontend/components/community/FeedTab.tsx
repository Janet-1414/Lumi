'use client'

import { useState } from 'react'
import { WinCard } from './WinCard'

interface Post {
  id:      number | string
  alias:   string
  emoji:   string
  message: string
  likes:   number
  time:    string
}

interface FeedTabProps {
  posts:    Post[]
  onLike:   (id: number | string) => void
}

/**
 * FeedTab — community wins feed with a compose box.
 * Posts are always anonymous — no real names or amounts.
 */
export function FeedTab({ posts, onLike }: FeedTabProps) {
  const [composing, setComposing] = useState(false)
  const [newPost,   setNewPost]   = useState('')
  const [localPosts, setLocalPosts] = useState(posts)

  const handlePost = () => {
    if (!newPost.trim()) return
    const post: Post = {
      id:      Date.now(),
      alias:   'You',
      emoji:   '✨',
      message: newPost.trim(),
      likes:   0,
      time:    'just now',
    }
    setLocalPosts((prev) => [post, ...prev])
    setNewPost('')
    setComposing(false)
  }

  return (
    <div className="feed-root">
      {/* Compose */}
      {!composing ? (
        <button className="compose-trigger" onClick={() => setComposing(true)}>
          🎉 Share a win with the community…
        </button>
      ) : (
        <div className="compose-box">
          <textarea
            className="compose-textarea"
            placeholder="Share your win (no amounts — keep it anonymous) 🎉"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="compose-actions">
            <span className="compose-anon">🔒 Posted anonymously</span>
            <button className="compose-cancel" onClick={() => { setComposing(false); setNewPost('') }}>
              Cancel
            </button>
            <button className="compose-submit" onClick={handlePost} disabled={!newPost.trim()}>
              Share win
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="feed-list">
        {localPosts.map((p) => (
          <WinCard key={p.id} {...p} onLike={onLike} />
        ))}
      </div>

      <style jsx>{`
        .feed-root { display: flex; flex-direction: column; gap: 10px; }

        .compose-trigger {
          width: 100%; padding: 12px; text-align: left;
          background: rgba(255,255,255,0.03);
          border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-muted); cursor: pointer;
          transition: all 0.2s;
        }
        .compose-trigger:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: rgba(250,199,117,0.04);
        }

        .compose-box {
          background: var(--bg-card);
          border: 1px solid rgba(250,199,117,0.3);
          border-radius: var(--radius-lg);
          padding: 1rem;
        }
        .compose-textarea {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-primary);
          resize: none; outline: none;
          transition: border-color 0.2s;
        }
        .compose-textarea:focus { border-color: var(--border-focus); }
        .compose-actions {
          display: flex; align-items: center; gap: 8px; margin-top: 10px;
        }
        .compose-anon {
          font-size: 11.5px; color: var(--text-muted); flex: 1;
        }
        .compose-cancel {
          background: none; border: 1px solid var(--border);
          border-radius: 20px; padding: 5px 12px;
          font-family: var(--font-body); font-size: 12px;
          color: var(--text-muted); cursor: pointer;
        }
        .compose-submit {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; border-radius: 20px; padding: 5px 14px;
          font-family: var(--font-body); font-size: 12px; font-weight: 600;
          color: #1a0f00; cursor: pointer; transition: opacity 0.2s;
        }
        .compose-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .feed-list { display: flex; flex-direction: column; gap: 10px; }
      `}</style>
    </div>
  )
}
