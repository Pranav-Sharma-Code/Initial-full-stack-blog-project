import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import UsersTable from '@/components/dashboard/UsersTable'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Manage Users — Inkwell' }

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Admin only
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard?error=forbidden')

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="up">
        <div className="up__header">
          <div>
            <h1 className="up__title">
              <Users size={22} aria-hidden="true" />
              Manage Users
            </h1>
            <p className="up__subtitle">
              Promote viewers to authors or admins. You cannot change your own role.
            </p>
          </div>
          <div className="up__badge">
            {users?.length ?? 0} total user{users?.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="up__legend">
          <span className="up__legend-item" style={{ color: '#64748b' }}>● viewer — can read &amp; comment</span>
          <span className="up__legend-item" style={{ color: '#a78bfa' }}>● author — can create &amp; edit own posts</span>
          <span className="up__legend-item" style={{ color: '#f59e0b' }}>● admin — full control</span>
        </div>

        <UsersTable
          users={users ?? []}
          currentUserId={user.id}
        />
      </div>

      <style>{`
        .up { display: flex; flex-direction: column; gap: 1.5rem; }

        .up__header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .up__title {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 1.75rem; font-weight: 700; color: #f1f5f9;
          letter-spacing: -0.03em; margin: 0 0 0.25rem;
        }
        .up__subtitle { color: #64748b; font-size: 0.875rem; margin: 0; }

        .up__badge {
          padding: 0.4rem 0.875rem; border-radius: 100px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.8rem; color: #94a3b8; white-space: nowrap;
          align-self: flex-start;
        }

        .up__legend {
          display: flex; flex-wrap: wrap; gap: 1rem;
          font-size: 0.78rem;
        }
        .up__legend-item { font-weight: 500; }
      `}</style>
    </>
  )
}
