import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PostCard from '@/components/blog/PostCard'
import SearchInput from '@/components/blog/SearchInput'
import { ChevronLeft, ChevronRight, PenSquare } from 'lucide-react'
import type { Post } from '@/types'

export const metadata: Metadata = {
  title: 'Inkwell — Ideas Worth Reading',
  description: 'A curated blog with AI-powered summaries on topics that matter.',
}

const PAGE_SIZE = 9

type Props = { searchParams: Promise<{ page?: string; search?: string }> }

export default async function HomePage({ searchParams }: Props) {
  const { page: pageParam, search = '' } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createSupabaseServerClient()

  // Check if current user is author/admin (for "write a post" CTA)
  const { data: { user } } = await supabase.auth.getUser()
  let canWrite = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    canWrite = ['author', 'admin'].includes(profile?.role ?? '')
  }

  let query = supabase
    .from('posts')
    .select('id, title, slug, summary, image_url, created_at, author_id, published, body, updated_at, profiles(name)', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.ilike('title', `%${search.trim()}%`)
  }

  const { data: posts, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const buildUrl = (p: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <>
      <div className="hp">
        {/* ── Nav ── */}
        <nav className="hp__nav">
          <Link href="/" className="hp__brand">
            <span className="hp__brand-icon">✍️</span>
            Inkwell
          </Link>
          <div className="hp__nav-actions">
            {user ? (
              <>
                {canWrite && (
                  <Link href="/dashboard/create" className="hp__btn hp__btn--ghost">
                    <PenSquare size={16} /> Write
                  </Link>
                )}
                <Link href="/dashboard" className="hp__btn hp__btn--primary">Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hp__btn hp__btn--ghost">Sign in</Link>
                <Link href="/register" className="hp__btn hp__btn--primary">Get started</Link>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="hp__hero">
          <h1 className="hp__hero-title">Ideas worth reading</h1>
          <p className="hp__hero-sub">
            Explore posts with AI-generated summaries to find exactly what you need — fast.
          </p>
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </header>

        {/* ── Search context ── */}
        {search && (
          <p className="hp__search-ctx">
            {count ?? 0} result{count !== 1 ? 's' : ''} for &ldquo;<strong>{search}</strong>&rdquo;
          </p>
        )}

        {/* ── Grid ── */}
        {!posts?.length ? (
          <div className="hp__empty">
            <p>No posts found{search ? ` for "${search}"` : ''}.</p>
            {canWrite && (
              <Link href="/dashboard/create" className="hp__btn hp__btn--primary">
                <PenSquare size={16} /> Be the first to write
              </Link>
            )}
          </div>
        ) : (
          <div className="hp__grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post as unknown as Post & { profiles: { name: string } | null }} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <nav className="hp__pagination" aria-label="Pagination">
            {page > 1 ? (
              <Link href={buildUrl(page - 1)} className="hp__page-btn">
                <ChevronLeft size={16} /> Prev
              </Link>
            ) : (
              <span className="hp__page-btn hp__page-btn--disabled">
                <ChevronLeft size={16} /> Prev
              </span>
            )}

            <div className="hp__page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl(p)}
                  className={`hp__page-num${p === page ? ' hp__page-num--active' : ''}`}
                >
                  {p}
                </Link>
              ))}
            </div>

            {page < totalPages ? (
              <Link href={buildUrl(page + 1)} className="hp__page-btn">
                Next <ChevronRight size={16} />
              </Link>
            ) : (
              <span className="hp__page-btn hp__page-btn--disabled">
                Next <ChevronRight size={16} />
              </span>
            )}
          </nav>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { background: #0a0a0f; color: #e2e8f0; margin: 0; }

        .hp {
          min-height: 100vh; max-width: 1200px;
          margin: 0 auto; padding: 0 1.5rem 4rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Nav ── */
        .hp__nav {
          display: flex; align-items: center;
          justify-content: space-between; padding: 1.25rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 3rem;
        }
        .hp__brand {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 1.25rem; font-weight: 700; text-decoration: none;
          background: linear-gradient(135deg, #e2e8f0, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hp__brand-icon { font-size: 1.4rem; -webkit-text-fill-color: initial; }
        .hp__nav-actions { display: flex; align-items: center; gap: 0.75rem; }

        .hp__btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1.1rem; border-radius: 9px;
          font-size: 0.875rem; font-weight: 500; text-decoration: none;
          transition: opacity 0.2s, background 0.2s;
        }
        .hp__btn--ghost {
          color: #94a3b8; background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .hp__btn--ghost:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .hp__btn--primary {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .hp__btn--primary:hover { opacity: 0.9; }

        /* ── Hero ── */
        .hp__hero {
          text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 1.25rem; margin-bottom: 3rem;
        }
        .hp__hero-title {
          font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800;
          color: #f1f5f9; letter-spacing: -0.04em; margin: 0;
          background: linear-gradient(135deg, #f1f5f9 40%, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hp__hero-sub {
          color: #64748b; font-size: 1.05rem; margin: 0;
          max-width: 520px; line-height: 1.6;
        }

        .hp__search-ctx {
          color: #64748b; font-size: 0.875rem; margin: 0 0 1.5rem;
        }
        .hp__search-ctx strong { color: #e2e8f0; }

        /* ── Grid ── */
        .hp__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem; margin-bottom: 3rem;
        }

        .hp__empty {
          text-align: center; padding: 4rem 2rem;
          color: #64748b; display: flex; flex-direction: column;
          align-items: center; gap: 1.25rem;
        }

        /* ── Pagination ── */
        .hp__pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; flex-wrap: wrap;
        }
        .hp__page-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.5rem 1rem; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; font-size: 0.875rem; text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .hp__page-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .hp__page-btn--disabled { opacity: 0.35; pointer-events: none; }
        .hp__page-numbers { display: flex; gap: 0.25rem; }
        .hp__page-num {
          width: 36px; height: 36px; display: flex; align-items: center;
          justify-content: center; border-radius: 8px;
          color: #94a3b8; font-size: 0.875rem; text-decoration: none;
          border: 1px solid transparent;
          transition: background 0.2s, color 0.2s;
        }
        .hp__page-num:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
        .hp__page-num--active {
          background: rgba(124,58,237,0.2);
          border-color: rgba(124,58,237,0.4); color: #a78bfa; font-weight: 600;
        }
      `}</style>
    </>
  )
}
