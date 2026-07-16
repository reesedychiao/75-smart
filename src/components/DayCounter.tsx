import type { StreakState } from '../lib/streak'

export default function DayCounter({ streak }: { streak: StreakState }) {
  const pct = Math.min(100, (streak.dayCount / 75) * 100)
  return (
    <section className="text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-400 dark:text-ink-500">
        day
      </p>
      <p className="font-serif text-8xl font-light leading-none text-ink-900 dark:text-ink-50">
        {streak.dayCount}
      </p>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">of 75</p>

      <div className="mx-auto mt-6 h-px w-full max-w-xs overflow-visible bg-ink-200 dark:bg-ink-700">
        <div
          className="h-[3px] -translate-y-[1px] rounded-full bg-accent-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {streak.resets > 0 && (
        <p className="mt-4 text-xs text-ink-400 dark:text-ink-500">
          {streak.resets} restart{streak.resets > 1 ? 's' : ''} — still here
        </p>
      )}
    </section>
  )
}
