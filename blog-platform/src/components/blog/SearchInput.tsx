'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const updateSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('search', term)
      } else {
        params.delete('search')
      }
      params.delete('page') // reset to page 1 on new search
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    // Debounce via timeout — avoid firing on every keystroke
    clearTimeout((window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer)
    ;(window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(
      () => updateSearch(e.target.value),
      400
    )
  }

  const handleClear = () => {
    setValue('')
    updateSearch('')
    inputRef.current?.focus()
  }

  return (
    <>
      <div className="si">
        <Search size={18} className="si__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          id="blog-search"
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="Search posts…"
          className={`si__input${isPending ? ' si__input--pending' : ''}`}
          aria-label="Search posts"
        />
        {value && (
          <button className="si__clear" onClick={handleClear} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      <style>{`
        .si {
          position: relative; display: flex; align-items: center;
          width: 100%; max-width: 420px;
        }
        .si__icon {
          position: absolute; left: 1rem; color: #64748b; pointer-events: none;
        }
        .si__input {
          width: 100%; padding: 0.7rem 2.75rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; color: #e2e8f0; font-size: 0.875rem;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .si__input::placeholder { color: #475569; }
        .si__input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .si__input--pending { opacity: 0.7; }
        .si__clear {
          position: absolute; right: 0.875rem; background: none; border: none;
          cursor: pointer; color: #64748b; display: flex; padding: 0.2rem;
          transition: color 0.2s;
        }
        .si__clear:hover { color: #94a3b8; }
      `}</style>
    </>
  )
}
