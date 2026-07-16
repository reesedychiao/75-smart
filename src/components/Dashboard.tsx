import { useEffect, useRef, useState } from 'react'
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
import FocusTimer from './FocusTimer'
import MilestoneOverlay from './MilestoneOverlay'

const MILESTONES = [25, 50, 75]
const MILESTONE_SEEN_KEY = '75smart-milestones'

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

  // Milestone days get a full-screen moment. Seen-state is keyed by the date
  // it was reached, so hitting day 25 again after a reset celebrates again,
  // but a reload on the same day doesn't.
  const [milestone, setMilestone] = useState<number | null>(null)
  useEffect(() => {
    if (!streak.todayComplete || !MILESTONES.includes(streak.dayCount)) return
    const seen = JSON.parse(localStorage.getItem(MILESTONE_SEEN_KEY) ?? '{}')
    if (seen[streak.dayCount] !== today) setMilestone(streak.dayCount)
  }, [streak.todayComplete, streak.dayCount, today])

  function dismissMilestone() {
    const seen = JSON.parse(localStorage.getItem(MILESTONE_SEEN_KEY) ?? '{}')
    seen[milestone!] = today
    localStorage.setItem(MILESTONE_SEEN_KEY, JSON.stringify(seen))
    setMilestone(null)
  }

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
          <FocusTimer
            todayLog={todayLog}
            onSessionDone={(key) => updateToday({ [key]: true })}
          />
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

      {milestone !== null && (
        <MilestoneOverlay
          milestone={milestone}
          streak={streak}
          onDismiss={dismissMilestone}
        />
      )}
    </div>
  )
}
