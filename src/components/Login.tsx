import { useState } from 'react'
import { Masthead } from './Masthead'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!value) {
      setError('Email required')
      return
    }
    setError(null)
    setStatus('sending')
    const { error: err } = await signInWithEmail(value)
    if (err) {
      setStatus('idle')
      setError(err)
      return
    }
    setStatus('sent')
  }

  return (
    <div className="wrap">
      <Masthead />
      <div className="center-screen">
        <div className="auth-card">
          <div className="section-meta" style={{ color: 'var(--ink-soft)' }}>
            Members Only
          </div>
          <p className="auth-note">
            Sign in with a magic link. This is a private clubhouse — accounts are by
            invitation only.
          </p>

          {status === 'sent' ? (
            <p className="auth-success">
              ◆ Link sent. Check your inbox to enter.
            </p>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="btn-row">
                <button className="btn" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send Magic Link'}
                </button>
              </div>
            </form>
          )}

          {error && <div className="auth-error">{error}</div>}
        </div>
      </div>
    </div>
  )
}
