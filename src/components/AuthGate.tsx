import { useState, type FormEvent } from 'react'
import { requireSupabase } from '../lib/supabase'

export default function AuthGate() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const supabase = requireSupabase()
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else if (mode === 'signup')
      setMessage('Check your email to confirm your account, then sign in.')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 dark:bg-ink-950">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl font-light tracking-tight text-ink-900 dark:text-ink-100">
          75 <span className="italic text-accent-500">Smart</span>
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          Six tasks a day. Seventy-five days. No shortcuts.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-accent-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-accent-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-ink-900 py-3 text-sm font-medium text-ink-50 transition hover:bg-ink-700 disabled:opacity-50 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-ink-300"
          >
            {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-accent-600 dark:text-accent-400">{message}</p>
        )}

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-6 text-xs text-ink-500 underline-offset-4 hover:underline dark:text-ink-400"
        >
          {mode === 'signin' ? 'First time? Create an account' : 'Already set up? Sign in'}
        </button>
      </div>
    </div>
  )
}
