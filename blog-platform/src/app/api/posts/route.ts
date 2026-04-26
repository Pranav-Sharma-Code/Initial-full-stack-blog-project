import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const PAGE_SIZE = 9

// ── GET /api/posts ───────────────────────────────────────────────
// Public: returns published posts with optional search + pagination.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search')?.trim() ?? ''

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('posts')
    .select('id, title, slug, summary, image_url, created_at, profiles(name)', {
      count: 'exact',
    })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    posts: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}

// ── POST /api/posts ──────────────────────────────────────────────
// Protected (author/admin): creates a new post.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Enforce role — RLS does this too, but fail fast here for a clear error
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['author', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden: author or admin role required' }, { status: 403 })
  }

  const { title, slug, body, image_url, published } = await request.json()

  if (!title || !slug || !body) {
    return NextResponse.json({ error: 'title, slug, and body are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      body,
      image_url: image_url ?? null,
      author_id: user.id,
      published: published ?? true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: data }, { status: 201 })
}
