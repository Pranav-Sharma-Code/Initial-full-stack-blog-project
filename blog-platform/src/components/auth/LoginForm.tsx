'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'

export default function LoginForm() {
  // ✅ FIX: Stable client ref — created exactly once, not on every render
  const supabaseRef = useRef(createSupabaseBrowserClient())
  const supabase = supabaseRef.current

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ✅ loginSchema infers LoginFormValues — they always match because
  // LoginFormValues = z.infer<typeof loginSchema>. No manual type sync needed.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      // Supabase returns a generic message — give users a friendlier one
      toast.error(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message
      )
      setIsLoading(false)
      return
    }

    toast.success('Welcome back! 👋')
    // router.refresh() is critical — it re-runs Server Components with the new session
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <>
      <div className="lf">
        <div className="lf__header">
          <h1 className="lf__title">Welcome back</h1>
          <p className="lf__subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lf__form" noValidate>
          {/* Email */}
          <div className="lf__field">
            <label htmlFor="login-email" className="lf__label">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`lf__input${errors.email ? ' lf__input--error' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <p className="lf__error" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="lf__field">
            <label htmlFor="login-password" className="lf__label">
              Password
            </label>
            <div className="lf__input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`lf__input lf__input--icon${errors.password ? ' lf__input--error' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="lf__eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="lf__error" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me + Forgot password row */}
          <div className="lf__row">
            <label className="lf__check-label">
              <input
                type="checkbox"
                className="lf__checkbox"
                {...register('rememberMe')}
              />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="lf__link lf__link--sm">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="lf__btn"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="lf__spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={18} aria-hidden="true" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="lf__footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="lf__link">
            Create one
          </Link>
        </p>
      </div>

      {/* ✅ Scoped styles — no Tailwind conflict, no hydration mismatch */}
      <style>{`
        .lf { display: flex; flex-direction: column; gap: 1.5rem; }

        .lf__header { text-align: center; }
        .lf__title {
          font-size: 1.75rem; font-weight: 700;
          color: #f1f5f9; letter-spacing: -0.03em;
          margin: 0 0 0.375rem;
        }
        .lf__subtitle { color: #64748b; font-size: 0.875rem; margin: 0; }

        .lf__form { display: flex; flex-direction: column; gap: 1rem; }

        .lf__field { display: flex; flex-direction: column; gap: 0.375rem; }
        .lf__label {
          font-size: 0.8rem; font-weight: 500;
          color: #94a3b8; letter-spacing: 0.02em;
        }

        .lf__input-wrap { position: relative; }

        .lf__input {
          width: 100%; padding: 0.72rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e2e8f0;
          font-size: 0.9rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .lf__input::placeholder { color: #475569; }
        .lf__input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
        }
        .lf__input--icon { padding-right: 2.75rem; }
        .lf__input--error { border-color: #ef4444; }
        .lf__input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }

        .lf__eye {
          position: absolute; right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #64748b; display: flex; padding: 0.25rem;
          transition: color 0.2s;
        }
        .lf__eye:hover { color: #94a3b8; }

        .lf__error { font-size: 0.78rem; color: #f87171; margin: 0; }

        .lf__row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem;
        }
        .lf__check-label {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.82rem; color: #94a3b8; cursor: pointer;
        }
        .lf__checkbox {
          width: 15px; height: 15px;
          accent-color: #7c3aed; cursor: pointer;
        }

        .lf__btn {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; width: 100%; padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          margin-top: 0.25rem;
        }
        .lf__btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(124,58,237,0.45);
        }
        .lf__btn:active:not(:disabled) { transform: translateY(0); }
        .lf__btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .lf__spin { animation: lfSpin 0.8s linear infinite; }
        @keyframes lfSpin { to { transform: rotate(360deg); } }

        .lf__link { color: #a78bfa; text-decoration: none; transition: color 0.2s; }
        .lf__link:hover { color: #c4b5fd; text-decoration: underline; }
        .lf__link--sm { font-size: 0.82rem; }

        .lf__footer {
          text-align: center; font-size: 0.85rem;
          color: #64748b; margin: 0;
        }
      `}</style>
    </>
  )
}
