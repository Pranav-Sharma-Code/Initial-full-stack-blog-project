'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CommentForm from './CommentForm'
import type { Comment } from '@/types'

type CommentWithProfile = Comment & {
  profiles: { name: string; avatar_url: string | null } | null
}

interface Props {
  postId: string
  initialComments: CommentWithProfile[]
  /** null means not logged in */
  currentUser: { id: string; name: string } | null
}

export default function CommentSection({ postId, initialComments, currentUser }: Props) {
  // ✅ Start with server-fetched comments; append new ones optimistically
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments)

  const handleCommentAdded = (newComment: CommentWithProfile) => {
    setComments((prev) => [...prev, newComment])
  }

  return (
    <>
      <section className="cs" aria-labelledby="comments-heading">
        <h2 className="cs__heading" id="comments-heading">
          <MessageCircle size={20} aria-hidden="true" />
          Comments
          <span className="cs__count">{comments.length}</span>
        </h2>

        {/* ── Comment form (logged-in only) ── */}
        {currentUser ? (
          <CommentForm
            postId={postId}
            authorName={currentUser.name}
            onCommentAdded={handleCommentAdded}
          />
        ) : (
          <div className="cs__login-prompt">
            <Link href="/login" className="cs__login-link">Sign in</Link>
            {' '}or{' '}
            <Link href="/register" className="cs__login-link">create an account</Link>
            {' '}to leave a comment.
          </div>
        )}

        {/* ── Comment list ── */}
        {comments.length === 0 ? (
          <p className="cs__empty">No comments yet. Be the first!</p>
        ) : (
          <div className="cs__list">
            {comments.map((comment) => {
              const name = comment.profiles?.name ?? 'Anonymous'
              const initial = name.charAt(0).toUpperCase()

              return (
                <div key={comment.id} className="cs__item">
                  {/* Avatar */}
                  <div className="cs__avatar" aria-hidden="true">{initial}</div>

                  {/* Body */}
                  <div className="cs__body">
                    <div className="cs__meta">
                      <span className="cs__author">{name}</span>
                      <span className="cs__dot">·</span>
                      <time className="cs__time" dateTime={comment.created_at}>
                        {formatDate(comment.created_at)}
                      </time>
                    </div>
                    <p className="cs__text">{comment.comment_text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <style>{`
        .cs {
          display: flex; flex-direction: column; gap: 1.5rem;
          padding-top: 2.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .cs__heading {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 1.2rem; font-weight: 700; color: #f1f5f9; margin: 0;
        }
        .cs__count {
          margin-left: 0.25rem; font-size: 0.85rem; font-weight: 400;
          color: #64748b; background: rgba(255,255,255,0.07);
          padding: 0.1rem 0.55rem; border-radius: 100px;
        }

        .cs__login-prompt {
          padding: 1rem 1.25rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;
          font-size: 0.875rem; color: #64748b;
        }
        .cs__login-link {
          color: #a78bfa; text-decoration: none; font-weight: 500;
          transition: color 0.2s;
        }
        .cs__login-link:hover { color: #c4b5fd; text-decoration: underline; }

        .cs__empty { color: #64748b; font-size: 0.875rem; margin: 0; }

        .cs__list { display: flex; flex-direction: column; gap: 1.25rem; }

        .cs__item {
          display: flex; gap: 0.875rem;
          padding: 1.125rem; border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.2s;
        }
        .cs__item:hover { border-color: rgba(255,255,255,0.1); }

        .cs__avatar {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 700; color: white;
        }

        .cs__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.375rem; }

        .cs__meta {
          display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
        }
        .cs__author { font-size: 0.875rem; font-weight: 600; color: #e2e8f0; }
        .cs__dot { color: #334155; font-size: 0.75rem; }
        .cs__time { font-size: 0.78rem; color: #64748b; }

        .cs__text {
          font-size: 0.9rem; color: #94a3b8; margin: 0;
          line-height: 1.65; white-space: pre-wrap; word-break: break-word;
        }
      `}</style>
    </>
  )
}
