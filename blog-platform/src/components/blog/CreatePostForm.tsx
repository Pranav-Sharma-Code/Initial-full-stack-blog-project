'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, Upload, Sparkles, Send } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(50, 'Body must be at least 50 characters'),
  published: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export default function CreatePostForm() {
  const supabaseRef = useRef(createSupabaseBrowserClient())
  const supabase = supabaseRef.current
  const router = useRouter()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [aiStep, setAiStep] = useState<'idle' | 'running' | 'done'>('idle')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', published: true },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const path = `${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, imageFile, { cacheControl: '3600', upsert: false })

    setUploading(false)

    if (error) {
      toast.error('Image upload failed: ' + error.message)
      return null
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return data.publicUrl
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)

    // 1. Upload image (if any)
    const imageUrl = await uploadImage()

    // 2. Create post via API
    const slug = generateSlug(values.title)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: values.title,
        slug,
        body: values.body,
        image_url: imageUrl,
        published: values.published,
      }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to create post')
      setSubmitting(false)
      return
    }

    const { post } = await res.json()
    toast.success('Post created!')

    // 3. Trigger AI summary (non-blocking — user is redirected immediately)
    setAiStep('running')
    fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, title: values.title, body: values.body }),
    })
      .then(() => setAiStep('done'))
      .catch(() => {}) // silent fail — summary can be retried

    router.push('/dashboard')
    router.refresh()
  }

  const title = watch('title')

  return (
    <>
      <div className="cpf">
        <div className="cpf__header">
          <h1 className="cpf__title">Create new post</h1>
          <p className="cpf__subtitle">
            Fill in the details below. AI summary is generated automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="cpf__form" noValidate>
          {/* Title */}
          <div className="cpf__field">
            <label htmlFor="post-title" className="cpf__label">Title</label>
            <input
              id="post-title"
              type="text"
              placeholder="My awesome post"
              className={`cpf__input${errors.title ? ' cpf__input--err' : ''}`}
              {...register('title')}
            />
            {title && (
              <p className="cpf__slug-preview">
                Slug: <code>{generateSlug(title)}</code>
              </p>
            )}
            {errors.title && <p className="cpf__error">{errors.title.message}</p>}
          </div>

          {/* Body */}
          <div className="cpf__field">
            <label htmlFor="post-body" className="cpf__label">Content</label>
            <textarea
              id="post-body"
              rows={14}
              placeholder="Write your post content here…"
              className={`cpf__input cpf__textarea${errors.body ? ' cpf__input--err' : ''}`}
              {...register('body')}
            />
            {errors.body && <p className="cpf__error">{errors.body.message}</p>}
          </div>

          {/* Image upload */}
          <div className="cpf__field">
            <label className="cpf__label">Cover image (optional, max 5 MB)</label>
            <label htmlFor="post-image" className="cpf__upload-area">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="cpf__image-preview" />
              ) : (
                <div className="cpf__upload-placeholder">
                  <Upload size={24} />
                  <span>Click to upload</span>
                </div>
              )}
              <input
                id="post-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="cpf__file-input"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Publish toggle */}
          <label className="cpf__check-label">
            <input type="checkbox" className="cpf__checkbox" {...register('published')} />
            <span>Publish immediately</span>
          </label>

          {/* AI notice */}
          <div className="cpf__ai-notice">
            <Sparkles size={16} className="cpf__sparkle" />
            <span>
              {aiStep === 'running'
                ? 'Generating AI summary…'
                : aiStep === 'done'
                ? 'AI summary generated ✓'
                : 'An AI summary (~200 words) will be auto-generated after publishing.'}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="create-post-btn"
            disabled={submitting || uploading}
            className="cpf__btn"
          >
            {submitting || uploading ? (
              <>
                <Loader2 size={18} className="cpf__spin" />
                {uploading ? 'Uploading image…' : 'Publishing…'}
              </>
            ) : (
              <>
                <Send size={18} />
                Publish post
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .cpf { max-width: 720px; }
        .cpf__header { margin-bottom: 2rem; }
        .cpf__title {
          font-size: 1.75rem; font-weight: 700; color: #f1f5f9;
          letter-spacing: -0.03em; margin: 0 0 0.25rem;
        }
        .cpf__subtitle { color: #64748b; font-size: 0.875rem; margin: 0; }

        .cpf__form { display: flex; flex-direction: column; gap: 1.25rem; }

        .cpf__field { display: flex; flex-direction: column; gap: 0.375rem; }
        .cpf__label { font-size: 0.8rem; font-weight: 500; color: #94a3b8; letter-spacing: 0.02em; }

        .cpf__input {
          width: 100%; padding: 0.72rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e2e8f0; font-size: 0.9rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .cpf__input::placeholder { color: #475569; }
        .cpf__input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
        }
        .cpf__input--err { border-color: #ef4444; }
        .cpf__textarea { resize: vertical; min-height: 240px; font-family: inherit; line-height: 1.6; }

        .cpf__slug-preview { font-size: 0.75rem; color: #64748b; margin: 0; }
        .cpf__slug-preview code { color: #a78bfa; }

        .cpf__error { font-size: 0.78rem; color: #f87171; margin: 0; }

        .cpf__upload-area {
          display: block; border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 12px; cursor: pointer; overflow: hidden;
          transition: border-color 0.2s;
          min-height: 140px;
        }
        .cpf__upload-area:hover { border-color: rgba(124,58,237,0.5); }
        .cpf__upload-placeholder {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.5rem; min-height: 140px; color: #64748b;
          font-size: 0.875rem;
        }
        .cpf__image-preview {
          width: 100%; max-height: 280px;
          object-fit: cover; display: block;
        }
        .cpf__file-input { display: none; }

        .cpf__check-label {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; color: #94a3b8; cursor: pointer;
        }
        .cpf__checkbox { accent-color: #7c3aed; width: 15px; height: 15px; }

        .cpf__ai-notice {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem; border-radius: 10px;
          background: rgba(167,139,250,0.08);
          border: 1px solid rgba(167,139,250,0.15);
          color: #a78bfa; font-size: 0.82rem;
        }
        .cpf__sparkle { flex-shrink: 0; }

        .cpf__btn {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .cpf__btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .cpf__btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cpf__spin { animation: cpfSpin 0.8s linear infinite; }
        @keyframes cpfSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
