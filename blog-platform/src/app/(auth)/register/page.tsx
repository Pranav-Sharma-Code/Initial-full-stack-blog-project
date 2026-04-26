import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account — Inkwell',
  description: 'Create your free Inkwell account and start writing today.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
