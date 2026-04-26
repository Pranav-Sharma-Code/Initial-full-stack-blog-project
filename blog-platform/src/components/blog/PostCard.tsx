import Link from 'next/link'
import Image from 'next/image'
import { formatDate, truncate } from '@/lib/utils'
import type { Post } from '@/types'

type PostWithAuthor = Omit<Post, 'profiles'> & {
  profiles: { name: string } | null
}

export default function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <>
      <Link href={`/blog/${post.slug}`} className="pc">
        {/* Cover image */}
        <div className="pc__img-wrap">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="pc__img"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="pc__img-placeholder">✍️</div>
          )}
        </div>

        {/* Body */}
        <div className="pc__body">
          <h2 className="pc__title">{post.title}</h2>

          {post.summary && (
            <p className="pc__summary">{truncate(post.summary, 140)}</p>
          )}

          <div className="pc__meta">
            <span className="pc__author">
              {(post.profiles as { name: string } | null)?.name ?? 'Unknown'}
            </span>
            <span className="pc__dot">·</span>
            <span className="pc__date">{formatDate(post.created_at)}</span>
          </div>
        </div>
      </Link>

      <style>{`
        .pc {
          display: flex; flex-direction: column;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
          text-decoration: none; color: inherit;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .pc:hover {
          transform: translateY(-3px);
          border-color: rgba(167,139,250,0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .pc__img-wrap {
          position: relative; width: 100%; height: 200px;
          background: rgba(255,255,255,0.03); overflow: hidden;
        }
        .pc__img { object-fit: cover; }
        .pc__img-placeholder {
          display: flex; align-items: center; justify-content: center;
          height: 100%; font-size: 2.5rem;
        }

        .pc__body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }

        .pc__title {
          font-size: 1.05rem; font-weight: 700; color: #f1f5f9;
          margin: 0; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc:hover .pc__title { color: #a78bfa; }

        .pc__summary {
          font-size: 0.82rem; color: #64748b; margin: 0;
          line-height: 1.6; flex: 1;
        }

        .pc__meta {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; color: #475569; margin-top: auto;
        }
        .pc__dot { color: #334155; }
        .pc__author { font-weight: 500; color: #64748b; }
      `}</style>
    </>
  )
}
