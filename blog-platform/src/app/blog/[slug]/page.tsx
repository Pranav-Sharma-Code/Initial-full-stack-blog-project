import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import CommentSection from '@/components/blog/CommentSection'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import type { Comment, Profile } from '@/types'

type Props = { params: Promise<{ slug: string }> }

// ── Reading time ────────────────────────────────────────────────────
function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200)) // avg 200 wpm
}

// ── Dynamic metadata ────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, summary, image_url')
    .eq('slug', slug)
    .single()

  if (!post) return { title: 'Post not found — Inkwell' }

  return {
    title: `${post.title} — Inkwell`,
    description: post.summary ?? `Read "${post.title}" on Inkwell.`,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      images: post.image_url ? [post.image_url] : [],
    },
  }
}

// ── Page ────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  // ── 1. Fetch post (with author profile) ─────────────────────────
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles(id, name, email, role, avatar_url, created_at)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !post) notFound()

  const author = post.profiles as Profile | null
  const mins = readingTime(post.body)

  // ── 2. Fetch comments (with commenter profiles) ──────────────────
  type CommentRow = Comment & { profiles: { name: string; avatar_url: string | null } | null }
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(name, avatar_url)')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true })

  // ── 3. Get current user (to decide if comment form shows) ────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentUser: { id: string; name: string } | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    currentUser = { id: user.id, name: profile?.name ?? user.email ?? 'You' }
  }

  return (
    <>
      <div className="bp">
        {/* ── Back nav ── */}
        <nav className="bp__nav">
          <Link href="/" className="bp__back">
            <ArrowLeft size={16} aria-hidden="true" />
            All posts
          </Link>
        </nav>

        {/* ── Hero ── */}
        <header className="bp__hero">
          <h1 className="bp__title">{post.title}</h1>

          {/* Meta row */}
          <div className="bp__meta">
            {/* Author */}
            <div className="bp__author">
              <div className="bp__author-avatar" aria-hidden="true">
                {author?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="bp__author-info">
                <span className="bp__author-name">{author?.name ?? 'Unknown'}</span>
                <span className="bp__author-role">{author?.role ?? 'author'}</span>
              </div>
            </div>

            <div className="bp__meta-right">
              <span className="bp__meta-item">
                <Clock size={14} aria-hidden="true" />
                {formatDate(post.created_at)}
              </span>
              <span className="bp__meta-item">
                <BookOpen size={14} aria-hidden="true" />
                {mins} min read
              </span>
            </div>
          </div>
        </header>

        {/* ── Cover image ── */}
        {post.image_url && (
          <div className="bp__cover-wrap">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              priority
              className="bp__cover-img"
              sizes="(max-width: 860px) 100vw, 860px"
            />
          </div>
        )}

        {/* ── AI Summary card ── */}
        {post.summary && (
          <aside className="bp__summary" aria-label="AI-generated summary">
            <div className="bp__summary-badge">✨ AI Summary</div>
            <p className="bp__summary-text">{post.summary}</p>
          </aside>
        )}

        {/* ── Article body ── */}
        <article className="bp__body">
          {post.body}
        </article>

        {/* ── Author card ── */}
        <div className="bp__author-card">
          <div className="bp__author-card-avatar">
            {author?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="bp__author-card-info">
            <p className="bp__author-card-label">Written by</p>
            <p className="bp__author-card-name">{author?.name ?? 'Unknown author'}</p>
            <p className="bp__author-card-role">{author?.role ?? 'author'}</p>
          </div>
        </div>

        {/* ── Comments ── */}
        <CommentSection
          postId={post.id}
          initialComments={(comments ?? []) as CommentRow[]}
          currentUser={currentUser}
        />
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        body {
          background: #0a0a0f; color: #e2e8f0; margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .bp {
          max-width: 720px; margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
          display: flex; flex-direction: column; gap: 2rem;
        }

        /* ── Back nav ── */
        .bp__nav { display: flex; }
        .bp__back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: #64748b; font-size: 0.875rem; text-decoration: none;
          transition: color 0.2s;
        }
        .bp__back:hover { color: #a78bfa; }

        /* ── Hero ── */
        .bp__hero { display: flex; flex-direction: column; gap: 1.25rem; }

        .bp__title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800; color: #f1f5f9;
          letter-spacing: -0.04em; margin: 0; line-height: 1.2;
        }

        .bp__meta {
          display: flex; align-items: center; flex-wrap: wrap;
          justify-content: space-between; gap: 1rem;
        }
        .bp__author { display: flex; align-items: center; gap: 0.625rem; }
        .bp__author-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .bp__author-name { display: block; font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }
        .bp__author-role {
          display: block; font-size: 0.75rem; color: #a78bfa;
          text-transform: capitalize;
        }
        .bp__meta-right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .bp__meta-item {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.8rem; color: #64748b;
        }

        /* ── Cover image ── */
        .bp__cover-wrap {
          position: relative; width: 100%; height: 400px;
          border-radius: 16px; overflow: hidden;
          background: rgba(255,255,255,0.04);
        }
        .bp__cover-img { object-fit: cover; }

        /* ── Summary card ── */
        .bp__summary {
          padding: 1.25rem 1.5rem;
          background: rgba(167,139,250,0.08);
          border: 1px solid rgba(167,139,250,0.2);
          border-left: 3px solid #7c3aed;
          border-radius: 12px;
          display: flex; flex-direction: column; gap: 0.625rem;
        }
        .bp__summary-badge {
          font-size: 0.75rem; font-weight: 600; color: #a78bfa;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .bp__summary-text {
          font-size: 0.925rem; color: #94a3b8; line-height: 1.7; margin: 0;
        }

        /* ── Article body ── */
        .bp__body {
          font-size: 1.05rem; line-height: 1.85; color: #cbd5e1;
          white-space: pre-wrap; word-break: break-word;
          padding: 0.5rem 0;
        }

        /* ── Author card ── */
        .bp__author-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
        }
        .bp__author-card-avatar {
          width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; font-weight: 700; color: white;
        }
        .bp__author-card-label {
          font-size: 0.72rem; color: #64748b; margin: 0 0 0.2rem;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .bp__author-card-name { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.15rem; }
        .bp__author-card-role {
          font-size: 0.8rem; color: #a78bfa; margin: 0; text-transform: capitalize;
        }

        @media (max-width: 640px) {
          .bp__cover-wrap { height: 240px; }
          .bp__meta { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  )
}
