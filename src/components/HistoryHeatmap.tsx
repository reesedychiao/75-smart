import { useState } from 'react'
import type { DayLog, DayStatus, StreakState } from '../lib/streak'
import { isComplete, TASK_KEYS } from '../lib/streak'
import { TASKS } from '../lib/tasks'

const CELL_STYLE: Record<DayStatus, string> = {
  complete: 'bg-accent-500',
  failed: 'bg-ink-200 dark:bg-ink-700',
  pending: 'border border-dashed border-ink-300 dark:border-ink-600',
}

function prettyDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

interface Props {
  streak: StreakState
  logs: DayLog[]
}

export default function HistoryHeatmap({ streak, logs }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  if (streak.history.length === 0) return null

  const byDate = new Map(logs.map((l) => [l.log_date, l]))
  const selectedLog = selected ? byDate.get(selected) : undefined
  const selectedStatus = selected
    ? streak.history.find((h) => h.date === selected)?.status
    : undefined

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
        History
      </h2>

      <div className="flex flex-wrap gap-1.5">
        {streak.history.map(({ date, status }) => (
          <button
            key={date}
            title={`${prettyDate(date)} — ${status}`}
            onClick={() => setSelected(selected === date ? null : date)}
            className={`h-4 w-4 rounded-[4px] transition hover:scale-125 ${CELL_STYLE[status]} ${
              selected === date ? 'ring-2 ring-ink-400 ring-offset-1 dark:ring-ink-500 dark:ring-offset-ink-900' : ''
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-[11px] text-ink-400 dark:text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent-500" /> complete
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink-200 dark:bg-ink-700" /> missed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-ink-300 dark:border-ink-600" /> today
        </span>
      </div>

      {selected && (
        <div className="mt-5 rounded-xl bg-ink-50 p-4 text-sm dark:bg-ink-800/50">
          <p className="font-medium text-ink-700 dark:text-ink-200">
            {prettyDate(selected)}
            <span className="ml-2 font-normal text-ink-400 dark:text-ink-500">
              {selectedLog
                ? `${TASK_KEYS.filter((k) => selectedLog[k]).length + (selectedLog.journal.trim() ? 1 : 0)}/7 done${isComplete(selectedLog) ? '' : ` · ${selectedStatus}`}`
                : 'no log'}
            </span>
          </p>
          {selectedLog && (
            <>
              <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                {TASKS.filter((t) => selectedLog[t.key])
                  .map((t) => t.label)
                  .join(' · ') || 'nothing checked'}
              </p>
              {selectedLog.journal.trim() && (
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-600 dark:text-ink-300">
                  {selectedLog.journal}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
