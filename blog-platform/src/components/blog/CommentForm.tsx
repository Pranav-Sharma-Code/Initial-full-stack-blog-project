'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, MessageSquarePlus } from 'lucide-react'
import type { Comment } from '@/types'

interface Props {
  postId: string
  /** Injected by the server page so this client component never calls getUser() */
  authorName: string
  onCommentAdded: (comment: Comment & { profiles: { name: string; avatar_url: string | null } }) => void
}

export default function CommentForm({ postId, authorName, onCommentAdded }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const MAX = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) { toast.error('Comment cannot be empty.'); return }

    setLoading(true)

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, comment_text: trimmed }),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(json.error ?? 'Failed to post comment.')
      return
    }

    toast.success('Comment posted!')
    setText('')
    onCommentAdded(json.comment)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="cf" noValidate>
        <div className="cf__meta">
          <div className="cf__avatar">{authorName.charAt(0).toUpperCase()}</div>
          <span className="cf__name">{authorName}</span>
        </div>

        <div className="cf__input-wrap">
          <textarea
            id="comment-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            maxLength={MAX}
            className="cf__textarea"
            disabled={loading}
          />
          <span className={`cf__counter${text.length > MAX * 0.9 ? ' cf__counter--warn' : ''}`}>
            {text.length}/{MAX}
          </span>
        </div>

        <div className="cf__footer">
          <button
            type="submit"
            id="submit-comment-btn"
            disabled={loading || !text.trim()}
            className="cf__btn"
          >
            {loading
              ? <><Loader2 size={16} className="cf__spin" aria-hidden="true" /> Posting…</>
              : <><MessageSquarePlus size={16} aria-hidden="true" /> Post comment</>}
          </button>
        </div>
      </form>

      <style>{`
        .cf { display: flex; flex-direction: column; gap: 0.875rem; }

        .cf__meta { display: flex; align-items: center; gap: 0.625rem; }
        .cf__avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .cf__name { font-size: 0.875rem; font-weight: 600; color: #e2e8f0; }

        .cf__input-wrap { position: relative; }
        .cf__textarea {
          width: 100%; padding: 0.875rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #e2e8f0; font-size: 0.875rem;
          font-family: inherit; line-height: 1.6; resize: vertical;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box; min-height: 90px;
        }
        .cf__textarea::placeholder { color: #475569; }
        .cf__textarea:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .cf__textarea:disabled { opacity: 0.6; cursor: not-allowed; }

        .cf__counter {
          position: absolute; bottom: 0.5rem; right: 0.75rem;
          font-size: 0.72rem; color: #475569;
        }
        .cf__counter--warn { color: #f87171; }

        .cf__footer { display: flex; justify-content: flex-end; }
        .cf__btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border: none; border-radius: 9px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .cf__btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .cf__btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        .cf__spin { animation: cfSpin 0.8s linear infinite; }
        @keyframes cfSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
