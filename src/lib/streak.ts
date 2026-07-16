// The streak engine: everything the app knows about your progress is derived
// from the raw day_logs rows by this pure function. Keeping it pure (no dates
// read from the system clock, no fetching) is what makes it unit-testable —
// the caller passes in "today" explicitly.

export const TASK_KEYS = [
  'deep_work_1',
  'deep_work_2',
  'meta_learning',
  'output',
  'reading',
  'no_dopamine',
] as const

export type TaskKey = (typeof TASK_KEYS)[number]

export interface DayLog {
  log_date: string // 'YYYY-MM-DD'
  deep_work_1: boolean
  deep_work_2: boolean
  meta_learning: boolean
  output: boolean
  reading: boolean
  no_dopamine: boolean
  journal: string
}

export type DayStatus = 'complete' | 'failed' | 'pending'

export interface StreakState {
  /** Days counted toward 75 since the last reset. Failed days never count. */
  dayCount: number
  /** True when yesterday failed and today isn't complete yet: one more miss resets to 0. */
  atRisk: boolean
  /** How many times the two-consecutive-fails rule has fired. */
  resets: number
  /** Complete days across the whole history, including before resets. */
  totalComplete: number
  /** totalComplete / finished days (today excluded until it's complete). 0–1. */
  completionRate: number
  /** First date ever logged, or null if the challenge hasn't started. */
  startDate: string | null
  todayComplete: boolean
  /** Status of every date from startDate to today, for the history heatmap. */
  history: { date: string; status: DayStatus }[]
}

/** A day satisfies the challenge when all 6 tasks are done. Task 6
 * ("log my progress") is the journal itself, so it counts when non-empty. */
export function isComplete(log: DayLog): boolean {
  const tasksDone = TASK_KEYS.every((k) => log[k])
  return tasksDone && log.journal.trim() !== ''
}

/** Date math on 'YYYY-MM-DD' strings. Uses UTC internally so DST shifts in
 * the local timezone can never skip or duplicate a calendar day. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function computeStreak(logs: DayLog[], today: string): StreakState {
  const empty: StreakState = {
    dayCount: 0,
    atRisk: false,
    resets: 0,
    totalComplete: 0,
    completionRate: 0,
    startDate: null,
    todayComplete: false,
    history: [],
  }
  if (logs.length === 0) return empty

  const byDate = new Map(logs.map((l) => [l.log_date, l]))
  const startDate = logs.map((l) => l.log_date).sort()[0]
  if (startDate > today) return empty // clock skew guard; treat as not started

  // Walk every calendar day from the first log to today. A past day with no
  // row is a failure — skipping the app doesn't pause the challenge.
  let dayCount = 0
  let resets = 0
  let totalComplete = 0
  let consecutiveFails = 0
  let yesterdayFailed = false
  const history: { date: string; status: DayStatus }[] = []

  for (let date = startDate; date <= today; date = addDays(date, 1)) {
    const log = byDate.get(date)
    const complete = log !== undefined && isComplete(log)

    if (complete) {
      dayCount++
      totalComplete++
      consecutiveFails = 0
      history.push({ date, status: 'complete' })
    } else if (date === today) {
      // Today is still in progress — it can't fail until it's over.
      history.push({ date, status: 'pending' })
    } else {
      consecutiveFails++
      history.push({ date, status: 'failed' })
      if (consecutiveFails >= 2) {
        // Two misses in a row: back to day 0. consecutiveFails restarts so a
        // third straight miss begins a new pair rather than resetting daily.
        dayCount = 0
        resets++
        consecutiveFails = 0
      }
    }
    if (date === addDays(today, -1)) yesterdayFailed = !complete
  }

  const todayComplete = history[history.length - 1].status === 'complete'
  // Rate is over finished days only, so an incomplete "today" doesn't drag it
  // down while you still have hours left to work.
  const finishedDays = history.filter((h) => h.status !== 'pending').length
  const completionRate = finishedDays === 0 ? 0 : totalComplete / finishedDays

  return {
    dayCount,
    atRisk: yesterdayFailed && !todayComplete,
    resets,
    totalComplete,
    completionRate,
    startDate,
    todayComplete,
    history,
  }
}
