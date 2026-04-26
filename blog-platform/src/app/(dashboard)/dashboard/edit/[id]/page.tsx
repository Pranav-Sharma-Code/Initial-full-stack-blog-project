import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import EditPostForm from '@/components/blog/EditPostForm'
import type { Post } from '@/types'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit Post — Inkwell' }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) notFound()

  // Authors can only edit their own posts; admins can edit any
  if (profile?.role !== 'admin' && post.author_id !== user.id) {
    redirect('/dashboard?error=forbidden')
  }

  return <EditPostForm post={post as Post} />
}
