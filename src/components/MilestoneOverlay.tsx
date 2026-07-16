import { useEffect } from 'react'
import type { StreakState } from '../lib/streak'
import { fireConfetti } from '../lib/confetti'

const MESSAGES: Record<number, { title: string; body: string }> = {
  25: {
    title: 'A third of the way.',
    body: 'Twenty-five days of showing up. The habit is forming — protect it.',
  },
  50: {
    title: 'Two thirds down.',
    body: 'Fifty days. The person who started this challenge would not recognize your discipline.',
  },
  75: {
    title: 'Seventy-five.',
    body: 'You did the whole thing. Every session, every page, every day you didn’t feel like it.',
  },
}

interface Props {
  milestone: number
  streak: StreakState
  onDismiss: () => void
}

export default function MilestoneOverlay({ milestone, streak, onDismiss }: Props) {
  useEffect(() => {
    fireConfetti()
    const id = setTimeout(fireConfetti, 700)
    return () => clearTimeout(id)
  }, [])

  const msg = MESSAGES[milestone] ?? MESSAGES[25]
  const finale = milestone === 75

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-950/95 px-6 backdrop-blur-sm">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-500">day</p>
        <p className="font-display text-9xl font-light text-accent-400">{milestone}</p>
        <h2 className="mt-6 font-display text-2xl font-light text-ink-100">
          {msg.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">{msg.body}</p>

        {finale && (
          <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-ink-800 px-4 py-5">
            <div>
              <p className="font-display text-2xl font-light text-ink-100">
                {streak.totalComplete}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-ink-500">
                days done
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-light text-ink-100">
                {Math.round(streak.completionRate * 100)}%
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-ink-500">
                hit rate
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-light text-ink-100">
                {streak.resets}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-ink-500">
                restarts
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="mt-10 rounded-lg border border-ink-700 px-8 py-3 text-sm text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
        >
          {finale ? 'take a bow' : 'keep going'}
        </button>
      </div>
    </div>
  )
}
