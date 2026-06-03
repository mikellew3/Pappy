import { Masthead } from './Masthead'

/** Shown when Supabase env vars are missing. */
export function ConfigError() {
  return (
    <div className="wrap">
      <Masthead />
      <div className="center-screen">
        <div className="auth-card">
          <div className="section-meta" style={{ color: 'var(--red)' }}>
            Configuration Required
          </div>
          <p className="auth-note">
            Supabase credentials are missing. Add these to <code>.env.local</code> (local) or
            your Vercel project environment variables, then reload:
          </p>
          <div className="config-pre">
            VITE_SUPABASE_URL=https://your-project-ref.supabase.co{'\n'}
            VITE_SUPABASE_ANON_KEY=your-anon-public-key
          </div>
        </div>
      </div>
    </div>
  )
}
