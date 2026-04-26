'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const supabaseRef = useRef(createSupabaseBrowserClient())
  const router = useRouter()

  const handleSignOut = async () => {
    await supabaseRef.current.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} className="dash-signout-btn">
      <LogOut size={16} />
      Sign out
      <style>{`
        .dash-signout-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 8px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          color: #f87171; font-size: 0.82rem; font-weight: 500;
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .dash-signout-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.4);
        }
      `}</style>
    </button>
  )
}
