import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string }> }

// ── GET /api/posts/[id] ──────────────────────────────────────────
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ post: data })
}

// ── PUT /api/posts/[id] ──────────────────────────────────────────
// RLS enforces: author can update own posts; admin can update any.
export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, slug, body, image_url, published } = await request.json()

  const { data, error } = await supabase
    .from('posts')
    .update({ title, slug, body, image_url, published, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post: data })
}

// ── DELETE /api/posts/[id] ───────────────────────────────────────
// RLS enforces: author can delete own posts; admin can delete any.
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
