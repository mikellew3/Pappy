import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import { Dashboard } from './components/Dashboard'
import { Login } from './components/Login'
import { ConfigError } from './components/ConfigError'

export default function App() {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) return <ConfigError />

  if (loading) {
    return (
      <div className="wrap">
        <div className="center-screen">
          <span className="loading-mark">◆ Loading…</span>
        </div>
      </div>
    )
  }

  return session ? <Dashboard /> : <Login />
}
