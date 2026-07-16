import type { StreakState } from '../lib/streak'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-light text-ink-800 dark:text-ink-200">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-ink-400 dark:text-ink-500">
        {label}
      </p>
    </div>
  )
}

export default function StatsRow({ streak }: { streak: StreakState }) {
  return (
    <section className="grid grid-cols-3 gap-4 rounded-2xl border border-ink-200 bg-white px-4 py-5 dark:border-ink-800 dark:bg-ink-900">
      <Stat label="total done" value={String(streak.totalComplete)} />
      <Stat label="hit rate" value={`${Math.round(streak.completionRate * 100)}%`} />
      <Stat label="restarts" value={String(streak.resets)} />
    </section>
  )
}
