import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// ── POST /api/comments ────────────────────────────────────────────
// Inserts a comment. User must be authenticated (RLS enforces user_id = auth.uid()).
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to comment.' }, { status: 401 })
  }

  const { post_id, comment_text } = await request.json()

  if (!post_id || !comment_text?.trim()) {
    return NextResponse.json({ error: 'post_id and comment_text are required.' }, { status: 400 })
  }

  if (comment_text.trim().length > 1000) {
    return NextResponse.json({ error: 'Comment must be under 1000 characters.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id,
      user_id: user.id,       // always the logged-in user — RLS double-checks this
      comment_text: comment_text.trim(),
    })
    .select('*, profiles(name, avatar_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment: data }, { status: 201 })
}
