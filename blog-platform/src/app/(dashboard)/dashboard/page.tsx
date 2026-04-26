import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { PenSquare, Trash2, Eye, EyeOff, PlusCircle } from 'lucide-react'
import DeletePostButton from '@/components/dashboard/DeletePostButton'

export const metadata: Metadata = { title: 'Dashboard — Inkwell' }

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  // Admins see all posts; authors see only their own
  const postsQuery = supabase
    .from('posts')
    .select('id, title, slug, published, created_at, summary')
    .order('created_at', { ascending: false })

  const { data: posts } = await (
    profile?.role === 'admin'
      ? postsQuery
      : postsQuery.eq('author_id', user.id)
  )

  const publishedCount = posts?.filter((p) => p.published).length ?? 0
  const draftCount = (posts?.length ?? 0) - publishedCount

  return (
    <>
      <div className="dp">
        {/* ── Header ── */}
        <div className="dp__header">
          <div>
            <h1 className="dp__title">Welcome back, {profile?.name?.split(' ')[0] ?? 'there'} 👋</h1>
            <p className="dp__subtitle">Manage your posts and content</p>
          </div>
          <Link href="/dashboard/create" className="dp__create-btn">
            <PlusCircle size={18} />
            New Post
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="dp__stats">
          <div className="dp__stat">
            <span className="dp__stat-num">{posts?.length ?? 0}</span>
            <span className="dp__stat-label">Total posts</span>
          </div>
          <div className="dp__stat">
            <span className="dp__stat-num dp__stat-num--green">{publishedCount}</span>
            <span className="dp__stat-label">Published</span>
          </div>
          <div className="dp__stat">
            <span className="dp__stat-num dp__stat-num--amber">{draftCount}</span>
            <span className="dp__stat-label">Drafts</span>
          </div>
        </div>

        {/* ── Posts table ── */}
        {!posts?.length ? (
          <div className="dp__empty">
            <p>No posts yet.</p>
            <Link href="/dashboard/create" className="dp__create-btn">
              <PlusCircle size={16} /> Write your first post
            </Link>
          </div>
        ) : (
          <div className="dp__table-wrap">
            <table className="dp__table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>AI Summary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/blog/${post.slug}`} className="dp__post-title">
                        {post.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`dp__badge ${post.published ? 'dp__badge--green' : 'dp__badge--amber'}`}>
                        {post.published ? <><Eye size={12} /> Published</> : <><EyeOff size={12} /> Draft</>}
                      </span>
                    </td>
                    <td className="dp__date">{formatDate(post.created_at)}</td>
                    <td>
                      <span className={`dp__ai-badge ${post.summary ? 'dp__ai-badge--done' : 'dp__ai-badge--none'}`}>
                        {post.summary ? '✓ Generated' : '— None'}
                      </span>
                    </td>
                    <td>
                      <div className="dp__actions">
                        <Link href={`/dashboard/edit/${post.id}`} className="dp__action-btn dp__action-btn--edit">
                          <PenSquare size={14} /> Edit
                        </Link>
                        <DeletePostButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dp { display: flex; flex-direction: column; gap: 2rem; }

        .dp__header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .dp__title {
          font-size: 1.75rem; font-weight: 700; color: #f1f5f9;
          letter-spacing: -0.03em; margin: 0 0 0.25rem;
        }
        .dp__subtitle { color: #64748b; font-size: 0.875rem; margin: 0; }

        .dp__create-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border-radius: 9px; font-size: 0.875rem;
          font-weight: 600; text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .dp__create-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .dp__stats {
          display: flex; gap: 1rem; flex-wrap: wrap;
        }
        .dp__stat {
          flex: 1; min-width: 120px; padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .dp__stat-num {
          font-size: 2rem; font-weight: 700; color: #e2e8f0;
          line-height: 1;
        }
        .dp__stat-num--green { color: #4ade80; }
        .dp__stat-num--amber { color: #fbbf24; }
        .dp__stat-label { font-size: 0.8rem; color: #64748b; }

        .dp__empty {
          text-align: center; padding: 3rem;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;
          color: #64748b; display: flex; flex-direction: column;
          align-items: center; gap: 1rem;
        }

        .dp__table-wrap {
          overflow-x: auto; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .dp__table {
          width: 100%; border-collapse: collapse;
          font-size: 0.875rem;
        }
        .dp__table th {
          padding: 0.875rem 1rem; text-align: left;
          color: #64748b; font-weight: 500; font-size: 0.78rem;
          letter-spacing: 0.05em; text-transform: uppercase;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .dp__table td {
          padding: 0.875rem 1rem; color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          vertical-align: middle;
        }
        .dp__table tr:last-child td { border-bottom: none; }
        .dp__table tr:hover td { background: rgba(255,255,255,0.02); }

        .dp__post-title {
          color: #e2e8f0; text-decoration: none; font-weight: 500;
          transition: color 0.2s;
        }
        .dp__post-title:hover { color: #a78bfa; }

        .dp__badge {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.2rem 0.6rem; border-radius: 100px;
          font-size: 0.75rem; font-weight: 500;
        }
        .dp__badge--green { background: rgba(74,222,128,0.1); color: #4ade80; }
        .dp__badge--amber { background: rgba(251,191,36,0.1); color: #fbbf24; }

        .dp__ai-badge { font-size: 0.78rem; }
        .dp__ai-badge--done { color: #a78bfa; }
        .dp__ai-badge--none { color: #475569; }

        .dp__date { color: #64748b; white-space: nowrap; }

        .dp__actions { display: flex; align-items: center; gap: 0.5rem; }
        .dp__action-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.3rem 0.7rem; border-radius: 7px;
          font-size: 0.78rem; font-weight: 500; cursor: pointer;
          text-decoration: none; transition: background 0.15s;
        }
        .dp__action-btn--edit {
          background: rgba(124,58,237,0.15); color: #a78bfa;
          border: 1px solid rgba(124,58,237,0.25);
        }
        .dp__action-btn--edit:hover { background: rgba(124,58,237,0.25); }
      `}</style>
    </>
  )
}
