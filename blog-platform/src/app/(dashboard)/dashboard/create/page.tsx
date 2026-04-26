import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CreatePostForm from '@/components/blog/CreatePostForm'

export const metadata: Metadata = { title: 'New Post — Inkwell' }

export default async function CreatePostPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Only author and admin can create posts
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['author', 'admin'].includes(profile.role)) {
    redirect('/dashboard?error=forbidden')
  }

  return <CreatePostForm />
}
