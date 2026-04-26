'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Loader2, Upload, Save } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import type { Post } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(50, 'Body must be at least 50 characters'),
  published: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export default function EditPostForm({ post }: { post: Post }) {
  const supabaseRef = useRef(createSupabaseBrowserClient())
  const supabase = supabaseRef.current
  const router = useRouter()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(post.image_url)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title,
      body: post.body,
      published: post.published,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return post.image_url // keep existing
    setUploading(true)
    const ext = imageFile.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, imageFile, { cacheControl: '3600', upsert: false })
    setUploading(false)
    if (error) { toast.error('Image upload failed: ' + error.message); return post.image_url }
    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return data.publicUrl
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    const imageUrl = await uploadImage()
    const slug = values.title !== post.title ? generateSlug(values.title) : post.slug

    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: values.title, slug, body: values.body, image_url: imageUrl, published: values.published }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error ?? 'Failed to update post')
      setSubmitting(false)
      return
    }

    toast.success('Post updated!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <div className="epf">
        <div className="epf__header">
          <h1 className="epf__title">Edit post</h1>
          <p className="epf__subtitle">Changes are saved immediately on submit.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="epf__form" noValidate>
          <div className="epf__field">
            <label htmlFor="edit-title" className="epf__label">Title</label>
            <input id="edit-title" type="text"
              className={`epf__input${errors.title ? ' epf__input--err' : ''}`}
              {...register('title')} />
            {errors.title && <p className="epf__error">{errors.title.message}</p>}
          </div>

          <div className="epf__field">
            <label htmlFor="edit-body" className="epf__label">Content</label>
            <textarea id="edit-body" rows={14}
              className={`epf__input epf__textarea${errors.body ? ' epf__input--err' : ''}`}
              {...register('body')} />
            {errors.body && <p className="epf__error">{errors.body.message}</p>}
          </div>

          <div className="epf__field">
            <label className="epf__label">Cover image (leave blank to keep existing)</label>
            <label htmlFor="edit-image" className="epf__upload-area">
              {imagePreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={imagePreview} alt="Preview" className="epf__img-preview" />
                : <div className="epf__upload-ph"><Upload size={24} /><span>Click to upload</span></div>}
              <input id="edit-image" type="file" accept="image/png,image/jpeg,image/webp"
                className="epf__file-input" onChange={handleImageChange} />
            </label>
          </div>

          <label className="epf__check-label">
            <input type="checkbox" className="epf__checkbox" {...register('published')} />
            <span>Published</span>
          </label>

          <button type="submit" id="edit-post-btn" disabled={submitting || uploading} className="epf__btn">
            {submitting || uploading
              ? <><Loader2 size={18} className="epf__spin" />{uploading ? 'Uploading…' : 'Saving…'}</>
              : <><Save size={18} />Save changes</>}
          </button>
        </form>
      </div>

      <style>{`
        .epf { max-width: 720px; }
        .epf__header { margin-bottom: 2rem; }
        .epf__title { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.03em; margin: 0 0 0.25rem; }
        .epf__subtitle { color: #64748b; font-size: 0.875rem; margin: 0; }
        .epf__form { display: flex; flex-direction: column; gap: 1.25rem; }
        .epf__field { display: flex; flex-direction: column; gap: 0.375rem; }
        .epf__label { font-size: 0.8rem; font-weight: 500; color: #94a3b8; letter-spacing: 0.02em; }
        .epf__input {
          width: 100%; padding: 0.72rem 1rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e2e8f0; font-size: 0.9rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .epf__input::placeholder { color: #475569; }
        .epf__input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
        .epf__input--err { border-color: #ef4444; }
        .epf__textarea { resize: vertical; min-height: 240px; font-family: inherit; line-height: 1.6; }
        .epf__error { font-size: 0.78rem; color: #f87171; margin: 0; }
        .epf__upload-area {
          display: block; border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 12px; cursor: pointer; overflow: hidden;
          transition: border-color 0.2s; min-height: 140px;
        }
        .epf__upload-area:hover { border-color: rgba(124,58,237,0.5); }
        .epf__upload-ph {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 0.5rem; min-height: 140px;
          color: #64748b; font-size: 0.875rem;
        }
        .epf__img-preview { width: 100%; max-height: 280px; object-fit: cover; display: block; }
        .epf__file-input { display: none; }
        .epf__check-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #94a3b8; cursor: pointer; }
        .epf__checkbox { accent-color: #7c3aed; width: 15px; height: 15px; }
        .epf__btn {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .epf__btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .epf__btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .epf__spin { animation: epfSpin 0.8s linear infinite; }
        @keyframes epfSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
