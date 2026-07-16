import { useCallback, useEffect, useRef, useState } from 'react'
import type { DayLog, TaskKey } from '../lib/streak'
import { playChime } from '../lib/chime'

const DURATIONS = [30, 35, 40, 45] as const
const STORAGE_KEY = '75smart-timer'

type Phase = 'idle' | 'running' | 'paused' | 'done'

interface Persisted {
  endsAt: number
  durationMin: number
  session: TaskKey | null
}

function fmt(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  todayLog: DayLog
  onSessionDone: (key: TaskKey) => void
}

export default function FocusTimer({ todayLog, onSessionDone }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [durationMin, setDurationMin] = useState<number>(30)
  const [remaining, setRemaining] = useState(30 * 60)
  // Which checkbox this session will credit — captured at start so completing
  // the task by hand mid-session doesn't redirect the credit.
  const sessionRef = useRef<TaskKey | null>(null)
  const endsAtRef = useRef<number | null>(null)

  const nextSession: TaskKey | null = !todayLog.deep_work_1
    ? 'deep_work_1'
    : !todayLog.deep_work_2
      ? 'deep_work_2'
      : null

  const finish = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    endsAtRef.current = null
    setPhase('done')
    playChime()
    if (sessionRef.current) onSessionDone(sessionRef.current)
  }, [onSessionDone])

  // Resume (or credit) a session that was running when the page last closed.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved: Persisted = JSON.parse(raw)
    sessionRef.current = saved.session
    setDurationMin(saved.durationMin)
    if (saved.endsAt > Date.now()) {
      endsAtRef.current = saved.endsAt
      setRemaining(Math.ceil((saved.endsAt - Date.now()) / 1000))
      setPhase('running')
    } else {
      // Ran out while the page was closed — the work happened, credit it.
      localStorage.removeItem(STORAGE_KEY)
      if (saved.session) onSessionDone(saved.session)
      setPhase('done')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      if (!endsAtRef.current) return
      const left = Math.ceil((endsAtRef.current - Date.now()) / 1000)
      if (left <= 0) finish()
      else setRemaining(left)
    }, 500)
    return () => clearInterval(id)
  }, [phase, finish])

  // Mirror the countdown into the tab title so it's visible from other tabs.
  useEffect(() => {
    if (phase === 'running') document.title = `${fmt(remaining)} · 75 Smart`
    else document.title = '75 Smart'
    return () => {
      document.title = '75 Smart'
    }
  }, [phase, remaining])

  function start() {
    sessionRef.current = nextSession
    const endsAt = Date.now() + remaining * 1000
    endsAtRef.current = endsAt
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ endsAt, durationMin, session: nextSession } satisfies Persisted),
    )
    setPhase('running')
  }

  function pause() {
    endsAtRef.current = null
    localStorage.removeItem(STORAGE_KEY)
    setPhase('paused')
  }

  function reset() {
    endsAtRef.current = null
    sessionRef.current = null
    localStorage.removeItem(STORAGE_KEY)
    setRemaining(durationMin * 60)
    setPhase('idle')
  }

  function pickDuration(min: number) {
    setDurationMin(min)
    setRemaining(min * 60)
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 text-center dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
          Deep work
        </h2>
        <span className="text-xs text-ink-300 dark:text-ink-600">
          {phase === 'done'
            ? 'session logged'
            : nextSession
              ? `counts as session ${nextSession === 'deep_work_1' ? 1 : 2}`
              : 'both sessions logged today'}
        </span>
      </div>

      {phase === 'done' ? (
        <div className="py-6">
          <p className="font-serif text-3xl font-light text-ink-900 dark:text-ink-100">
            Well sat.
          </p>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Take a break — you earned it.
          </p>
          <button
            onClick={reset}
            className="mt-4 text-xs text-ink-500 underline-offset-4 hover:underline dark:text-ink-400"
          >
            start another
          </button>
        </div>
      ) : (
        <>
          <p className="py-4 font-serif text-6xl font-light tabular-nums text-ink-900 dark:text-ink-50">
            {fmt(remaining)}
          </p>

          {phase === 'idle' && (
            <div className="mb-4 flex justify-center gap-2">
              {DURATIONS.map((min) => (
                <button
                  key={min}
                  onClick={() => pickDuration(min)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    durationMin === min
                      ? 'bg-ink-900 text-ink-50 dark:bg-ink-100 dark:text-ink-900'
                      : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3">
            {phase === 'running' ? (
              <button
                onClick={pause}
                className="rounded-lg border border-ink-200 px-6 py-2 text-sm text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                pause
              </button>
            ) : (
              <button
                onClick={start}
                className="rounded-lg bg-ink-900 px-6 py-2 text-sm font-medium text-ink-50 transition hover:bg-ink-700 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-ink-300"
              >
                {phase === 'paused' ? 'resume' : 'begin'}
              </button>
            )}
            {phase === 'paused' && (
              <button
                onClick={reset}
                className="rounded-lg border border-ink-200 px-6 py-2 text-sm text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                reset
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
