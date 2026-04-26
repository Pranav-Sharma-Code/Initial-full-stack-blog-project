import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — Inkwell',
  description: 'Sign in to your Inkwell account to read and write articles.',
}

export default function LoginPage() {
  return (
    // Suspense is required because LoginForm uses useSearchParams()
    <Suspense fallback={<div style={{ color: '#64748b', textAlign: 'center' }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
