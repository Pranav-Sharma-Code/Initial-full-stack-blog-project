'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth'

export default function RegisterForm() {
  // ✅ FIX: Stable ref — no new client instance on every render
  const supabaseRef = useRef(createSupabaseBrowserClient())
  const supabase = supabaseRef.current
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    // ✅ FIX: Explicit defaultValues required by react-hook-form + Zod
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }
    setRegistered(true)
    setIsLoading(false)
  }

  if (registered) {
    return (
      <div className="rf__success">
        <div className="rf__success-icon" aria-hidden="true">✉️</div>
        <h2 className="rf__success-title">Check your email</h2>
        <p className="rf__success-msg">
          We sent a confirmation link to your inbox. Click it to activate your account.
        </p>
        <Link href="/login" className="rf__link">Back to sign in</Link>
        <style>{`
          .rf__success{display:flex;flex-direction:column;align-items:center;gap:1rem;text-align:center;padding:1rem 0}
          .rf__success-icon{font-size:3rem}
          .rf__success-title{font-size:1.4rem;font-weight:700;color:#f1f5f9;margin:0}
          .rf__success-msg{color:#64748b;font-size:.9rem;margin:0;line-height:1.6}
          .rf__link{color:#a78bfa;text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s}
          .rf__link:hover{color:#c4b5fd}
        `}</style>
      </div>
    )
  }

  return (
    <div className="rf">
      <div className="rf__header">
        <h1 className="rf__title">Create account</h1>
        <p className="rf__subtitle">Join Inkwell and start writing today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rf__form" noValidate>
        {/* Name */}
        <div className="rf__field">
          <label htmlFor="reg-name" className="rf__label">Full name</label>
          <input id="reg-name" type="text" autoComplete="name"
            placeholder="Jane Doe"
            className={`rf__input ${errors.name ? 'rf__input--error' : ''}`}
            {...register('name')} />
          {errors.name && <p className="rf__error" role="alert">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="rf__field">
          <label htmlFor="reg-email" className="rf__label">Email address</label>
          <input id="reg-email" type="email" autoComplete="email"
            placeholder="you@example.com"
            className={`rf__input ${errors.email ? 'rf__input--error' : ''}`}
            {...register('email')} />
          {errors.email && <p className="rf__error" role="alert">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="rf__field">
          <label htmlFor="reg-password" className="rf__label">Password</label>
          <div className="rf__input-wrapper">
            <input id="reg-password" type={showPassword ? 'text' : 'password'}
              autoComplete="new-password" placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`rf__input rf__input--with-icon ${errors.password ? 'rf__input--error' : ''}`}
              {...register('password')} />
            <button type="button" className="rf__eye-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="rf__error" role="alert">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="rf__field">
          <label htmlFor="reg-confirm" className="rf__label">Confirm password</label>
          <div className="rf__input-wrapper">
            <input id="reg-confirm" type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password" placeholder="••••••••"
              className={`rf__input rf__input--with-icon ${errors.confirmPassword ? 'rf__input--error' : ''}`}
              {...register('confirmPassword')} />
            <button type="button" className="rf__eye-btn"
              onClick={() => setShowConfirm(v => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="rf__error" role="alert">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" id="register-submit-btn" disabled={isLoading} className="rf__btn">
          {isLoading
            ? <><Loader2 size={18} className="rf__spin" /> Creating account…</>
            : <><UserPlus size={18} /> Create account</>}
        </button>
      </form>

      <p className="rf__footer">
        Already have an account?{' '}
        <Link href="/login" className="rf__link">Sign in</Link>
      </p>

      <style>{`
        .rf{display:flex;flex-direction:column;gap:1.5rem}
        .rf__header{text-align:center}
        .rf__title{font-size:1.75rem;font-weight:700;color:#f1f5f9;letter-spacing:-.03em;margin:0 0 .375rem}
        .rf__subtitle{color:#64748b;font-size:.9rem;margin:0}
        .rf__form{display:flex;flex-direction:column;gap:.875rem}
        .rf__field{display:flex;flex-direction:column;gap:.375rem}
        .rf__label{font-size:.8rem;font-weight:500;color:#94a3b8;letter-spacing:.02em}
        .rf__input-wrapper{position:relative}
        .rf__input{width:100%;padding:.72rem 1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#e2e8f0;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s;box-sizing:border-box}
        .rf__input::placeholder{color:#475569}
        .rf__input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.2)}
        .rf__input--with-icon{padding-right:2.75rem}
        .rf__input--error{border-color:#ef4444}
        .rf__input--error:focus{box-shadow:0 0 0 3px rgba(239,68,68,.2)}
        .rf__eye-btn{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;display:flex;padding:.25rem;transition:color .2s}
        .rf__eye-btn:hover{color:#94a3b8}
        .rf__error{font-size:.78rem;color:#f87171;margin:0}
        .rf__btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;padding:.8rem 1.5rem;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;transition:opacity .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(124,58,237,.35);margin-top:.25rem}
        .rf__btn:hover:not(:disabled){opacity:.92;transform:translateY(-1px);box-shadow:0 6px 24px rgba(124,58,237,.45)}
        .rf__btn:active:not(:disabled){transform:translateY(0)}
        .rf__btn:disabled{opacity:.6;cursor:not-allowed}
        .rf__spin{animation:rfSpin .8s linear infinite}
        @keyframes rfSpin{to{transform:rotate(360deg)}}
        .rf__link{color:#a78bfa;text-decoration:none;transition:color .2s}
        .rf__link:hover{color:#c4b5fd;text-decoration:underline}
        .rf__footer{text-align:center;font-size:.85rem;color:#64748b;margin:0}
      `}</style>
    </div>
  )
}
