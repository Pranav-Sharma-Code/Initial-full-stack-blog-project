import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      {/* Animated gradient background */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
      </div>

      {/* Centered card */}
      <main className="auth-container">
        {/* Brand mark */}
        <div className="auth-brand">
          <div className="auth-brand__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className="auth-brand__name">Inkwell</span>
        </div>

        {children}
      </main>

      <style>{`
        .auth-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Orb background ── */
        .auth-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .auth-bg__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .auth-bg__orb--1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #7c3aed, transparent 70%);
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .auth-bg__orb--2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #2563eb, transparent 70%);
          bottom: -100px; right: -80px;
          animation-delay: -3s;
        }
        .auth-bg__orb--3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #db2777, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -6s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
        .auth-bg__orb--3 {
          animation-name: orbFloat3;
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, calc(-50% - 20px)) scale(1.08); }
        }

        /* ── Card ── */
        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 24px 64px rgba(0,0,0,0.5);
        }

        /* ── Brand mark ── */
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 2rem;
          justify-content: center;
        }
        .auth-brand__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
        }
        .auth-brand__name {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  )
}
