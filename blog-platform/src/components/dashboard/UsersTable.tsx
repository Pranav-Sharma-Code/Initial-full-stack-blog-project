'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

const ROLES: UserRole[] = ['viewer', 'author', 'admin']

const ROLE_COLORS: Record<UserRole, string> = {
  viewer: '#64748b',
  author: '#a78bfa',
  admin: '#f59e0b',
}

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export default function UsersTable({ users, currentUserId }: {
  users: User[]
  currentUserId: string
}) {
  const [list, setList] = useState<User[]>(users)
  const [loading, setLoading] = useState<string | null>(null) // userId being updated

  const changeRole = async (userId: string, newRole: UserRole) => {
    setLoading(userId)
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })

    const json = await res.json()
    setLoading(null)

    if (!res.ok) {
      toast.error(json.error ?? 'Failed to update role')
      return
    }

    toast.success(`${json.profile.name}'s role updated to ${newRole}`)
    setList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )
  }

  return (
    <>
      <div className="ut__wrap">
        <table className="ut__table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => {
              const isYou = user.id === currentUserId
              return (
                <tr key={user.id}>
                  <td>
                    <div className="ut__user">
                      <div className="ut__avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="ut__name">{user.name}{isYou && <span className="ut__you"> (you)</span>}</p>
                      </div>
                    </div>
                  </td>
                  <td className="ut__email">{user.email}</td>
                  <td className="ut__date">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className="ut__role-badge" style={{ color: ROLE_COLORS[user.role], background: `${ROLE_COLORS[user.role]}18`, border: `1px solid ${ROLE_COLORS[user.role]}33` }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {isYou ? (
                      <span className="ut__no-change">—</span>
                    ) : (
                      <div className="ut__role-btns">
                        {ROLES.filter((r) => r !== user.role).map((r) => (
                          <button
                            key={r}
                            onClick={() => changeRole(user.id, r)}
                            disabled={loading === user.id}
                            className="ut__role-btn"
                            style={{ '--btn-color': ROLE_COLORS[r] } as React.CSSProperties}
                          >
                            {loading === user.id ? '…' : `→ ${r}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .ut__wrap {
          overflow-x: auto; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .ut__table {
          width: 100%; border-collapse: collapse; font-size: 0.875rem;
        }
        .ut__table th {
          padding: 0.875rem 1rem; text-align: left;
          color: #64748b; font-weight: 500; font-size: 0.75rem;
          letter-spacing: 0.05em; text-transform: uppercase;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ut__table td {
          padding: 0.875rem 1rem; color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          vertical-align: middle;
        }
        .ut__table tr:last-child td { border-bottom: none; }
        .ut__table tr:hover td { background: rgba(255,255,255,0.02); }

        .ut__user { display: flex; align-items: center; gap: 0.625rem; }
        .ut__avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; color: white;
        }
        .ut__name { font-weight: 500; color: #e2e8f0; margin: 0; font-size: 0.875rem; }
        .ut__you { color: #64748b; font-weight: 400; }
        .ut__email { color: #64748b; font-size: 0.82rem; }
        .ut__date { color: #64748b; font-size: 0.8rem; white-space: nowrap; }
        .ut__no-change { color: #334155; }

        .ut__role-badge {
          display: inline-block; padding: 0.2rem 0.65rem;
          border-radius: 100px; font-size: 0.75rem; font-weight: 600;
          text-transform: capitalize;
        }

        .ut__role-btns { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .ut__role-btn {
          padding: 0.25rem 0.6rem; border-radius: 7px; font-size: 0.75rem;
          font-weight: 500; cursor: pointer; border: 1px solid;
          border-color: color-mix(in srgb, var(--btn-color) 30%, transparent);
          background: color-mix(in srgb, var(--btn-color) 12%, transparent);
          color: var(--btn-color);
          transition: background 0.15s;
        }
        .ut__role-btn:hover:not(:disabled) {
          background: color-mix(in srgb, var(--btn-color) 22%, transparent);
        }
        .ut__role-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  )
}
