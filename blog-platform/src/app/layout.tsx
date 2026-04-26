import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Inkwell — A Modern Blog Platform',
    template: '%s | Inkwell',
  },
  description:
    'Inkwell is a production-quality blogging platform with AI-powered summaries, role-based access, and a beautiful reading experience.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1b2e',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#a78bfa', secondary: '#1e1b2e' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1e1b2e' },
            },
          }}
        />
      </body>
    </html>
  )
}
