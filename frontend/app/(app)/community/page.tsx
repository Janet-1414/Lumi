'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'

// ─── Placeholder data ─────────────────────────────────────────────────────────

const PULSE = {
  headline:      "Lumi users saved a combined UGX 124M this week 🌍",
  active_savers: 1847,
  top_category:  "Food & Dining",
}

const FEED = [
  { id: 1, alias: "SavingsLion_KLA",   emoji: "🦁", message: "Just hit 60% of my emergency fund! Starting from zero 6 months ago 💪", likes: 47, time: "2h" },
  { id: 2, alias: "BudgetQueen_ABJ",   emoji: "👑", message: "Cooked at home all week and saved my transport budget. Small wins count!", likes: 31, time: "4h" },
  { id: 3, alias: "ZaraSaves",          emoji: "🎯", message: "First time saving 20% of my salary this month. It's actually possible!", likes: 28, time: "6h" },
  { id: 4, alias: "TundeMoney",         emoji: "🔥", message: "Paid off my data loan. Never borrowing for airtime again!", likes: 22, time: "1d" },
  { id: 5, alias: "AkosuaFinance_ACC",  emoji: "😂", message: "14-day saving streak! The Lumi fire emoji keeps me going lol", likes: 19, time: "1d" },
]

const CHALLENGES = [
  { id: 1, emoji: "🍳", title: "No Eating Out Challenge",  desc: "Cook all meals at home for 7 days",       participants: 234, pct: 68.0, duration: "7 days" },
  { id: 2, emoji: "🚌", title: "Transport Budget Week",    desc: "Cut transport spending by 30% this week", participants: 189, pct: 45.2, duration: "7 days" },
  { id: 3, emoji: "💪", title: "No-Spend Weekend",         desc: "Zero non-essential spending Sat–Sun",      participants: 312, pct: 82.1, duration: "3 days" },
  { id: 4, emoji: "📱", title: "Airtime Fast",             desc: "Buy only UGX 5,000 airtime this week",     participants: 97,  pct: 31.5, duration: "7 days" },
]

const LEADERBOARD = [
  { rank: 1, alias: "DiamondSaver_LGS", pct: 97.4, tier: "💎", isYou: false },
  { rank: 2, alias: "GoldGoals_NBO",    pct: 94.1, tier: "🥇", isYou: false },
  { rank: 3, alias: "SavingsLion_KLA",  pct: 91.7, tier: "🥇", isYou: false },
  { rank: 4, alias: "BudgetQueen_ABJ",  pct: 88.3, tier: "🥈", isYou: false },
  { rank: 5, alias: "You",              pct: 75.0, tier: "🥈", isYou: true  },
  { rank: 6, alias: "ZaraSaves",        pct: 71.2, tier: "🥈", isYou: false },
  { rank: 7, alias: "TundeMoney",       pct: 68.9, tier: "🥉", isYou: false },
  { rank: 8, alias: "AkosuaFinance",    pct: 61.3, tier: "🥉", isYou: false },
]

const TIPS = [
  { id: 1, alias: "BudgetQueen_ABJ", tip: "Set your savings transfer for the same day as salary. Treat it like a bill.", likes: 89 },
  { id: 2, alias: "SavingsLion_KLA", tip: "Delete your payment apps for 48 hours when temptation strikes. Works every time.", likes: 72 },
  { id: 3, alias: "GoldGoals_NBO",   tip: "Use three MoMo wallets: bills, spending, savings. Never mix them.", likes: 61 },
  { id: 4, alias: "DiamondSaver",    tip: "Track every UGX 500 boda fare. The small ones add up to UGX 60k/month.", likes: 54 },
]

type Tab = 'feed' | 'challenges' | 'leaderboard' | 'tips'

// ─── Sub components ───────────────────────────────────────────────────────────

function WinCard({ post, onLike }: { post: typeof FEED[0]; onLike: (id: number) => void }) {
  return (
    <div className="win-card">
      <div className="win-header">
        <div className="win-avatar">{post.emoji}</div>
        <div className="win-meta">
          <div className="win-alias">{post.alias}</div>
          <div className="win-time">{post.time} ago</div>
        </div>
        <span className="win-badge">🏆 Win</span>
      </div>
      <p className="win-message">{post.message}</p>
      <button className="win-like" onClick={() => onLike(post.id)}>
        ❤️ {post.likes}
      </button>
      <style jsx>{`
        .win-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1rem 1.1rem;
          transition: border-color 0.2s;
        }
        .win-card:hover { border-color: rgba(250,199,117,0.3); }
        .win-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .win-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(250,199,117,0.1);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
          flex-shrink: 0;
        }
        .win-alias { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .win-time  { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
        .win-badge {
          margin-left: auto; font-size: 11px; font-weight: 600;
          background: rgba(250,199,117,0.1); color: var(--gold);
          padding: 2px 8px; border-radius: 10px;
        }
        .win-message { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 10px; }
        .win-like {
          background: none; border: 1px solid var(--border);
          border-radius: 20px; padding: 4px 12px;
          font-family: var(--font-body); font-size: 12px; color: var(--text-secondary);
          cursor: pointer; transition: all 0.2s;
        }
        .win-like:hover { border-color: rgba(237,147,177,0.5); color: #ED93B1; }
      `}</style>
    </div>
  )
}

function ChallengeCard({ c }: { c: typeof CHALLENGES[0] }) {
  const [joined, setJoined] = useState(false)
  return (
    <div className="chal-card">
      <div className="chal-header">
        <span className="chal-emoji">{c.emoji}</span>
        <div className="chal-info">
          <div className="chal-title">{c.title}</div>
          <div className="chal-desc">{c.desc}</div>
        </div>
        <span className="chal-duration">{c.duration}</span>
      </div>
      <div className="chal-bar-bg">
        <div className="chal-bar-fill" style={{ width: `${c.pct}%` }} />
      </div>
      <div className="chal-footer">
        <span className="chal-ppl">👥 {c.participants} participants · {c.pct}% complete</span>
        <button
          className={`chal-btn ${joined ? 'chal-btn--joined' : ''}`}
          onClick={() => setJoined(!joined)}
        >
          {joined ? '✓ Joined' : 'Join'}
        </button>
      </div>
      <style jsx>{`
        .chal-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1rem 1.1rem;
        }
        .chal-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
        .chal-emoji { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .chal-title { font-size: 13.5px; font-weight: 600; color: var(--text-primary); }
        .chal-desc  { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .chal-duration {
          margin-left: auto; flex-shrink: 0; font-size: 11px; color: var(--teal);
          background: rgba(29,158,117,0.1); padding: 2px 8px; border-radius: 10px; height: fit-content;
        }
        .chal-bar-bg { height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
        .chal-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #1D9E75, #FAC775); }
        .chal-footer { display: flex; align-items: center; justify-content: space-between; }
        .chal-ppl { font-size: 11.5px; color: var(--text-muted); }
        .chal-btn {
          padding: 5px 14px; border-radius: 20px;
          background: rgba(250,199,117,0.1); border: 1px solid rgba(250,199,117,0.3);
          font-family: var(--font-body); font-size: 12px; color: var(--gold);
          cursor: pointer; transition: all 0.2s;
        }
        .chal-btn:hover { background: rgba(250,199,117,0.2); }
        .chal-btn--joined { background: rgba(29,158,117,0.15); border-color: rgba(29,158,117,0.3); color: var(--teal); }
      `}</style>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab]     = useState<Tab>('feed')
  const [feed, setFeed]   = useState(FEED)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  const TABS: Array<{ value: Tab; label: string; emoji: string }> = [
    { value: 'feed',        label: 'Feed',        emoji: '🏆' },
    { value: 'challenges',  label: 'Challenges',  emoji: '💪' },
    { value: 'leaderboard', label: 'Leaderboard', emoji: '📊' },
    { value: 'tips',        label: 'Tips',        emoji: '💡' },
  ]

  const handleLike = (id: number) =>
    setFeed(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))

  const handlePost = () => {
    if (!newPost.trim()) return
    setFeed(prev => [{
      id: Date.now(), alias: 'You', emoji: '✨',
      message: newPost.trim(), likes: 0, time: 'just now',
    }, ...prev])
    setNewPost('')
    setPosting(false)
  }

  return (
    <AppShell userName="Akosua">
      <div className="comm-page">

        {/* Weekly Pulse */}
        <div className="pulse-card">
          <div className="pulse-icon">🌍</div>
          <div>
            <div className="pulse-headline">{PULSE.headline}</div>
            <div className="pulse-sub">
              {PULSE.active_savers.toLocaleString()} active savers · Top category: {PULSE.top_category}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="comm-tabs">
          {TABS.map(t => (
            <button
              key={t.value}
              className={`comm-tab ${tab === t.value ? 'comm-tab--active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {tab === 'feed' && (
          <div className="tab-content">
            {!posting ? (
              <button className="post-trigger" onClick={() => setPosting(true)}>
                🎉 Share a win with the community…
              </button>
            ) : (
              <div className="post-compose">
                <textarea
                  className="post-textarea"
                  placeholder="Share your win (no amounts — keep it anonymous) 🎉"
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="post-actions">
                  <span className="post-anon">🔒 Posted anonymously</span>
                  <button className="post-cancel" onClick={() => { setPosting(false); setNewPost('') }}>Cancel</button>
                  <button className="post-submit" onClick={handlePost} disabled={!newPost.trim()}>Share win</button>
                </div>
              </div>
            )}
            <div className="feed-list">
              {feed.map(p => <WinCard key={p.id} post={p} onLike={handleLike} />)}
            </div>
          </div>
        )}

        {/* Challenges */}
        {tab === 'challenges' && (
          <div className="tab-content chal-grid">
            {CHALLENGES.map(c => <ChallengeCard key={c.id} c={c} />)}
          </div>
        )}

        {/* Leaderboard */}
        {tab === 'leaderboard' && (
          <div className="tab-content">
            <div className="lb-notice">
              🔒 Ranked by savings goal % only — no actual amounts are ever shown
            </div>
            <div className="lb-list">
              {LEADERBOARD.map(e => (
                <div key={e.rank} className={`lb-row ${e.isYou ? 'lb-row--you' : ''}`}>
                  <div className="lb-rank">{e.rank <= 3 ? ['🥇','🥈','🥉'][e.rank-1] : e.rank}</div>
                  <div className="lb-alias">
                    {e.alias}
                    {e.isYou && <span className="lb-you-tag">You</span>}
                  </div>
                  <div className="lb-bar-wrap">
                    <div className="lb-bar-bg">
                      <div className="lb-bar-fill" style={{ width: `${e.pct}%` }} />
                    </div>
                  </div>
                  <div className="lb-pct">{e.pct}%</div>
                  <div className="lb-tier">{e.tier}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {tab === 'tips' && (
          <div className="tab-content">
            {TIPS.map(t => (
              <div key={t.id} className="tip-card">
                <div className="tip-header">
                  <span className="tip-alias">{t.alias}</span>
                  <span className="tip-likes">❤️ {t.likes}</span>
                </div>
                <p className="tip-text">"{t.tip}"</p>
              </div>
            ))}
          </div>
        )}

      </div>

      <style jsx>{`
        .comm-page { display: flex; flex-direction: column; gap: 1.25rem; padding-top: 1.5rem; }

        /* Pulse */
        .pulse-card {
          display: flex; align-items: center; gap: 14px;
          background: linear-gradient(135deg, rgba(250,199,117,0.08), rgba(29,158,117,0.05));
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-lg); padding: 1rem 1.25rem;
        }
        .pulse-icon { font-size: 28px; flex-shrink: 0; }
        .pulse-headline { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .pulse-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

        /* Tabs */
        .comm-tabs {
          display: flex; gap: 6px; flex-wrap: wrap;
          background: rgba(255,255,255,0.03); border-radius: 10px; padding: 4px;
        }
        .comm-tab {
          flex: 1; min-width: 80px; padding: 8px 10px; border-radius: 7px;
          border: none; background: none; cursor: pointer;
          font-family: var(--font-body); font-size: 13px; font-weight: 500;
          color: var(--text-secondary); transition: all 0.2s; white-space: nowrap;
        }
        .comm-tab:hover { color: var(--text-primary); }
        .comm-tab--active {
          background: linear-gradient(135deg, #FAC775, #EF9F27); color: #1a0f00;
        }

        /* Tab content */
        .tab-content { display: flex; flex-direction: column; gap: 10px; }
        .chal-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }

        /* Post compose */
        .post-trigger {
          width: 100%; padding: 12px; text-align: left;
          background: rgba(255,255,255,0.03); border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          font-family: var(--font-body); font-size: 13.5px; color: var(--text-muted);
          cursor: pointer; transition: all 0.2s;
        }
        .post-trigger:hover { border-color: var(--gold); color: var(--gold); background: rgba(250,199,117,0.04); }

        .post-compose {
          background: var(--bg-card); border: 1px solid rgba(250,199,117,0.3);
          border-radius: var(--radius-lg); padding: 1rem;
        }
        .post-textarea {
          width: 100%; background: var(--bg-input); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 10px 12px;
          font-family: var(--font-body); font-size: 13.5px; color: var(--text-primary);
          resize: none; outline: none; transition: border-color 0.2s;
        }
        .post-textarea:focus { border-color: var(--border-focus); }
        .post-actions { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
        .post-anon { font-size: 11.5px; color: var(--text-muted); flex: 1; }
        .post-cancel {
          background: none; border: 1px solid var(--border); border-radius: 20px;
          padding: 5px 12px; font-family: var(--font-body); font-size: 12px;
          color: var(--text-muted); cursor: pointer;
        }
        .post-submit {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; border-radius: 20px; padding: 5px 14px;
          font-family: var(--font-body); font-size: 12px; font-weight: 600;
          color: #1a0f00; cursor: pointer; transition: opacity 0.2s;
        }
        .post-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Feed */
        .feed-list { display: flex; flex-direction: column; gap: 10px; }

        /* Leaderboard */
        .lb-notice {
          font-size: 12px; color: var(--text-muted);
          background: rgba(255,255,255,0.03); border-radius: 8px;
          padding: 8px 12px; margin-bottom: 4px;
        }
        .lb-list { display: flex; flex-direction: column; gap: 4px; }
        .lb-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          transition: background 0.15s;
        }
        .lb-row:hover { background: rgba(255,255,255,0.03); }
        .lb-row--you {
          background: rgba(250,199,117,0.07);
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: 10px;
        }
        .lb-rank { font-size: 15px; width: 28px; text-align: center; flex-shrink: 0; }
        .lb-alias {
          font-size: 13px; font-weight: 500; color: var(--text-primary);
          flex-shrink: 0; min-width: 140px;
          display: flex; align-items: center; gap: 6px;
        }
        .lb-you-tag {
          font-size: 10px; background: rgba(250,199,117,0.2); color: var(--gold);
          padding: 1px 6px; border-radius: 8px;
        }
        .lb-bar-wrap { flex: 1; }
        .lb-bar-bg { height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .lb-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #1D9E75, #FAC775); }
        .lb-pct { font-size: 12px; font-weight: 600; color: var(--gold); width: 44px; text-align: right; flex-shrink: 0; }
        .lb-tier { font-size: 16px; flex-shrink: 0; }

        /* Tips */
        .tip-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1rem 1.1rem;
        }
        .tip-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .tip-alias { font-size: 12.5px; font-weight: 600; color: var(--gold); }
        .tip-likes { font-size: 12px; color: var(--text-muted); }
        .tip-text { font-size: 13.5px; color: var(--text-secondary); line-height: 1.65; font-style: italic; }

        @media (max-width: 500px) { .comm-tabs { gap: 4px; } .comm-tab { font-size: 12px; } }
      `}</style>
    </AppShell>
  )
}
