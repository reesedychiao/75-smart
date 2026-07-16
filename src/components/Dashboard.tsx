import { useEffect, useRef } from 'react'
import { requireSupabase } from '../lib/supabase'
import { useDayLogs } from '../hooks/useDayLogs'
import { quoteForDay } from '../lib/quotes'
import { fireConfetti } from '../lib/confetti'
import type { TaskKey } from '../lib/streak'
import DayCounter from './DayCounter'
import RiskBanner from './RiskBanner'
import Checklist from './Checklist'
import JournalEditor from './JournalEditor'
import QuoteCard from './QuoteCard'
import StatsRow from './StatsRow'
import HistoryHeatmap from './HistoryHeatmap'

export default function Dashboard({ userId }: { userId: string }) {
  const { logs, todayLog, streak, today, loading, error, updateToday } =
    useDayLogs(userId)

  // Celebrate the moment today flips to complete (not on page load of an
  // already-complete day).
  const wasComplete = useRef<boolean | null>(null)
  useEffect(() => {
    if (wasComplete.current === false && streak.todayComplete) fireConfetti()
    if (!loading) wasComplete.current = streak.todayComplete
  }, [streak.todayComplete, loading])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-950">
        <p className="text-sm text-ink-400">loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <div className="mx-auto max-w-xl px-6 pb-24 pt-10">
        <header className="mb-12 flex items-baseline justify-between">
          <span className="text-sm font-medium tracking-tight text-ink-900 dark:text-ink-100">
            75 <span className="font-serif italic text-accent-500">Smart</span>
          </span>
          <span className="flex items-baseline gap-4 text-xs text-ink-400 dark:text-ink-500">
            {new Date(`${today}T00:00:00`).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            <button
              onClick={() => requireSupabase().auth.signOut()}
              className="underline-offset-4 hover:underline"
            >
              sign out
            </button>
          </span>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-300/50 bg-red-500/10 px-5 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-10">
          <DayCounter streak={streak} />
          {streak.atRisk && <RiskBanner />}
          <QuoteCard quote={quoteForDay(streak.startDate, today)} />
          <Checklist
            todayLog={todayLog}
            onToggle={(key: TaskKey, value: boolean) => updateToday({ [key]: value })}
          />
          <JournalEditor
            key={today} // remount at midnight so the textarea resets with the new day
            value={todayLog.journal}
            onSave={(journal) => updateToday({ journal })}
          />
          <StatsRow streak={streak} />
          <HistoryHeatmap streak={streak} logs={logs} />
        </div>
      </div>
    </div>
  )
}
