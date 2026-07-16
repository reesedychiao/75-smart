import { useCallback, useEffect, useMemo, useState } from 'react'
import { requireSupabase } from '../lib/supabase'
import { localToday } from '../lib/dates'
import { computeStreak, type DayLog } from '../lib/streak'

const EMPTY_TODAY = {
  deep_work_1: false,
  deep_work_2: false,
  meta_learning: false,
  output: false,
  reading: false,
  no_dopamine: false,
  journal: '',
}

export function useDayLogs(userId: string) {
  const [logs, setLogs] = useState<DayLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [today, setToday] = useState(localToday)

  // If the tab stays open past midnight, roll "today" over so the checklist
  // resets and yesterday's result becomes final.
  useEffect(() => {
    const id = setInterval(() => setToday(localToday()), 60_000)
    return () => clearInterval(id)
  }, [])

  const refetch = useCallback(async () => {
    const { data, error } = await requireSupabase()
      .from('day_logs')
      .select('*')
      .order('log_date')
    if (error) {
      setError(error.message)
    } else {
      setLogs(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const todayLog: DayLog = useMemo(
    () =>
      logs.find((l) => l.log_date === today) ?? { log_date: today, ...EMPTY_TODAY },
    [logs, today],
  )

  const streak = useMemo(() => computeStreak(logs, today), [logs, today])

  /** Apply a partial change to today's row: optimistic local update first so
   * the UI never waits on the network, then persist. On failure we refetch,
   * which rolls the UI back to the server's truth. */
  const updateToday = useCallback(
    async (patch: Partial<Omit<DayLog, 'log_date'>>) => {
      const next = { ...todayLog, ...patch }
      setLogs((prev) => [
        ...prev.filter((l) => l.log_date !== today),
        next,
      ].sort((a, b) => a.log_date.localeCompare(b.log_date)))

      const { error } = await requireSupabase()
        .from('day_logs')
        .upsert({ ...next, user_id: userId }, { onConflict: 'user_id,log_date' })
      if (error) {
        setError(`Couldn't save: ${error.message}`)
        refetch()
      } else {
        setError(null)
      }
    },
    [todayLog, today, userId, refetch],
  )

  return { logs, todayLog, streak, today, loading, error, updateToday }
}
