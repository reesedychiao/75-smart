import { useEffect, useState } from 'react'
import type { DayLog, TaskKey } from '../lib/streak'
import { TASKS } from '../lib/tasks'

function Check({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
        done
          ? 'border-accent-500 bg-accent-500'
          : 'border-ink-300 dark:border-ink-600'
      }`}
    >
      <svg
        viewBox="0 0 10 8"
        className={`h-2.5 w-2.5 transition-opacity ${done ? 'opacity-100' : 'opacity-0'}`}
      >
        <path
          d="M1 4l2.5 2.5L9 1"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** Live "Xh Ym left" hint for the no-dopamine rule, refreshed each minute. */
function useUntilFivePm() {
  const [label, setLabel] = useState('')
  useEffect(() => {
    function update() {
      const now = new Date()
      const five = new Date(now)
      five.setHours(17, 0, 0, 0)
      if (now >= five) {
        setLabel('past 5 pm — you made it')
        return
      }
      const mins = Math.ceil((five.getTime() - now.getTime()) / 60_000)
      setLabel(`${Math.floor(mins / 60)}h ${mins % 60}m until 5 pm`)
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])
  return label
}

interface Props {
  todayLog: DayLog
  onToggle: (key: TaskKey, value: boolean) => void
}

export default function Checklist({ todayLog, onToggle }: Props) {
  const untilFive = useUntilFivePm()
  const journalDone = todayLog.journal.trim() !== ''

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <ul className="divide-y divide-ink-100 dark:divide-ink-800">
        {TASKS.map((task) => {
          const done = todayLog[task.key]
          return (
            <li key={task.key}>
              <button
                onClick={() => onToggle(task.key, !done)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-ink-50 dark:hover:bg-ink-800/50"
              >
                <Check done={done} />
                <span className="flex-1">
                  <span
                    className={`block text-sm transition ${
                      done
                        ? 'text-ink-400 line-through dark:text-ink-500'
                        : 'text-ink-800 dark:text-ink-200'
                    }`}
                  >
                    {task.label}
                  </span>
                  <span className="block text-xs text-ink-400 dark:text-ink-500">
                    {task.key === 'no_dopamine' ? untilFive : task.hint}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {/* Task 6 is the journal itself — it checks off automatically. */}
        <li className="flex items-center gap-4 px-5 py-4 opacity-90">
          <Check done={journalDone} />
          <span className="flex-1">
            <span
              className={`block text-sm ${
                journalDone
                  ? 'text-ink-400 line-through dark:text-ink-500'
                  : 'text-ink-800 dark:text-ink-200'
              }`}
            >
              Log your progress
            </span>
            <span className="block text-xs text-ink-400 dark:text-ink-500">
              write today’s journal below — this checks itself
            </span>
          </span>
        </li>
      </ul>
    </section>
  )
}
