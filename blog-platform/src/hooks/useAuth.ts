'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

/**
 * useAuth — reactive auth hook for client components.
 *
 * FIX: The Supabase client is memoised in a ref so it is created exactly
 * once per component mount. Without this, createSupabaseBrowserClient()
 * returns a new object reference on every render, making the [supabase]
 * dependency in useEffect/useCallback re-fire on every render (infinite loop).
 */
export function useAuth(): UseAuthReturn {
  // ✅ FIX: Use a stable ref — never changes between renders
  const supabaseRef = useRef(createSupabaseBrowserClient())
  const supabase = supabaseRef.current

  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[useAuth] Failed to fetch profile:', error.message)
        return null
      }
      return data as Profile
    },
    // supabase is now stable (from ref), so this callback is only created once
    [supabase]
  )

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (currentUser) {
        setUser(currentUser)
        const profileData = await fetchProfile(currentUser.id)
        if (isMounted) setProfile(profileData)
      }

      if (isMounted) setLoading(false)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id)
        if (isMounted) setProfile(profileData)
      } else {
        setProfile(null)
      }

      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/login')
    router.refresh()
  }, [supabase, router])

  return { user, profile, loading, signOut }
}
