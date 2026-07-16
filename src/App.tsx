import { useAuth } from './hooks/useAuth'
import { supabase } from './lib/supabase'
import AuthGate from './components/AuthGate'
import Dashboard from './components/Dashboard'

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 dark:bg-ink-950">
      <div className="max-w-md text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <h1 className="mb-3 font-display text-2xl font-light text-ink-900 dark:text-ink-100">
          Almost there
        </h1>
        <p>
          Supabase isn’t configured yet. Copy <code>.env.example</code> to{' '}
          <code>.env.local</code>, fill in your project’s URL and anon key, and
          restart the dev server. The README has the full setup walkthrough.
        </p>
      </div>
    </div>
  )
}

// Config never changes at runtime, so branching before the hook-using
// component mounts keeps the rules of hooks intact.
function AuthedApp() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-ink-50 dark:bg-ink-950" />
  }
  if (!session) {
    return <AuthGate />
  }
  return <Dashboard userId={session.user.id} />
}

export default function App() {
  if (!supabase) return <SetupNotice />
  return <AuthedApp />
}
