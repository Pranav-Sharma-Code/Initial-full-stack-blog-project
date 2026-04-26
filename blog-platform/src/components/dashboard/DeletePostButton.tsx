'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeletePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return

    setLoading(true)
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })

    if (!res.ok) {
      toast.error('Failed to delete post.')
      setLoading(false)
      return
    }

    toast.success('Post deleted.')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="dpb-btn"
        aria-label="Delete post"
      >
        {loading ? <Loader2 size={14} className="dpb-spin" /> : <Trash2 size={14} />}
        Delete
      </button>

      <style>{`
        .dpb-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.3rem 0.7rem; border-radius: 7px;
          font-size: 0.78rem; font-weight: 500; cursor: pointer;
          background: rgba(239,68,68,0.12); color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
          transition: background 0.15s;
        }
        .dpb-btn:hover:not(:disabled) { background: rgba(239,68,68,0.22); }
        .dpb-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .dpb-spin { animation: dpbSpin 0.8s linear infinite; }
        @keyframes dpbSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
