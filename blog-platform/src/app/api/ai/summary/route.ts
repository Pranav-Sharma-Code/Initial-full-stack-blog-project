import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generatePostSummary } from '@/lib/ai'

// ── POST /api/ai/summary ─────────────────────────────────────────
// Generates an AI summary for a post and saves it to the DB.
// IDEMPOTENT: if the post already has a summary, returns it immediately.
// This ensures the AI is never called twice for the same post.
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId, title, body } = await request.json()

  if (!postId || !title || !body) {
    return NextResponse.json({ error: 'postId, title, and body are required' }, { status: 400 })
  }

  // ── Idempotency check: only generate if summary is NULL ──────────
  const { data: existingPost } = await supabase
    .from('posts')
    .select('summary')
    .eq('id', postId)
    .single()

  if (existingPost?.summary) {
    return NextResponse.json({ summary: existingPost.summary })
  }

  // ── Generate via Gemini ─────────────────────────────────────────
  try {
    const summary = await generatePostSummary(title, body)

    const { error } = await supabase
      .from('posts')
      .update({ summary })
      .eq('id', postId)

    if (error) throw error

    return NextResponse.json({ summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[AI Summary] Error:', message)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
