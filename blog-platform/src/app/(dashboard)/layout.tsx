import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/dashboard/SignOutButton'
import { LayoutDashboard, PenSquare, Home, Users } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Belt-and-suspenders: proxy already redirects, but guard here too
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  const initials = (profile?.name ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className="dash-shell">
        {/* ── Sidebar ── */}
        <aside className="dash-sidebar">
          <div className="dash-brand">
            <div className="dash-brand-icon">✍️</div>
            <span className="dash-brand-name">Inkwell</span>
          </div>

          <nav className="dash-nav">
            <Link href="/dashboard" className="dash-nav-link">
              <LayoutDashboard size={17} />
              Dashboard
            </Link>
            <Link href="/dashboard/create" className="dash-nav-link">
              <PenSquare size={17} />
              New Post
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/dashboard/users" className="dash-nav-link">
                <Users size={17} />
                Manage Users
              </Link>
            )}
            <Link href="/" className="dash-nav-link">
              <Home size={17} />
              View Blog
            </Link>
          </nav>

          <div className="dash-user">
            <div className="dash-avatar">{initials}</div>
            <div className="dash-user-info">
              <p className="dash-user-name">{profile?.name ?? user.email}</p>
              <p className="dash-user-role">{profile?.role ?? 'viewer'}</p>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <SignOutButton />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="dash-main">{children}</main>
      </div>

      <style>{`
        .dash-shell {
          display: flex; min-height: 100vh;
          background: #0a0a0f; color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Sidebar ── */
        .dash-sidebar {
          width: 240px; flex-shrink: 0;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.07);
          padding: 1.5rem 1rem;
          display: flex; flex-direction: column; gap: 2rem;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }

        .dash-brand {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0 0.5rem;
        }
        .dash-brand-icon { font-size: 1.4rem; }
        .dash-brand-name {
          font-size: 1.25rem; font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dash-nav { display: flex; flex-direction: column; gap: 0.25rem; }
        .dash-nav-link {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.6rem 0.75rem; border-radius: 8px;
          color: #94a3b8; font-size: 0.875rem; font-weight: 500;
          text-decoration: none; transition: background 0.15s, color 0.15s;
        }
        .dash-nav-link:hover {
          background: rgba(255,255,255,0.06); color: #e2e8f0;
        }

        .dash-user {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .dash-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .dash-user-name {
          font-size: 0.82rem; font-weight: 600; color: #e2e8f0;
          margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 130px;
        }
        .dash-user-role {
          font-size: 0.72rem; color: #a78bfa; margin: 0;
          text-transform: capitalize;
        }
        .dash-user-info { min-width: 0; }

        /* ── Main ── */
        .dash-main {
          flex: 1; padding: 2rem; min-width: 0; overflow-y: auto;
        }

        @media (max-width: 768px) {
          .dash-sidebar { display: none; }
          .dash-main { padding: 1rem; }
        }
      `}</style>
    </>
  )
}
