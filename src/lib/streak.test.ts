import { describe, expect, it } from 'vitest'
import { addDays, computeStreak, isComplete, type DayLog } from './streak'

function log(date: string, overrides: Partial<DayLog> = {}): DayLog {
  return {
    log_date: date,
    deep_work_1: true,
    deep_work_2: true,
    meta_learning: true,
    output: true,
    reading: true,
    no_dopamine: true,
    journal: 'did the work',
    ...overrides,
  }
}

describe('isComplete', () => {
  it('requires all six tasks', () => {
    expect(isComplete(log('2026-07-01'))).toBe(true)
    expect(isComplete(log('2026-07-01', { reading: false }))).toBe(false)
  })

  it('treats an empty journal as not having logged progress', () => {
    expect(isComplete(log('2026-07-01', { journal: '' }))).toBe(false)
    expect(isComplete(log('2026-07-01', { journal: '   ' }))).toBe(false)
  })
})

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('computeStreak', () => {
  it('returns the empty state before any logs exist', () => {
    const s = computeStreak([], '2026-07-16')
    expect(s.dayCount).toBe(0)
    expect(s.startDate).toBeNull()
    expect(s.history).toEqual([])
  })

  it('counts consecutive complete days', () => {
    const s = computeStreak(
      [log('2026-07-13'), log('2026-07-14'), log('2026-07-15')],
      '2026-07-15',
    )
    expect(s.dayCount).toBe(3)
    expect(s.atRisk).toBe(false)
    expect(s.resets).toBe(0)
    expect(s.todayComplete).toBe(true)
  })

  it('holds the count through a single failed day (failed days never count)', () => {
    // Complete, complete, failed, complete -> count is 3, not 4
    const s = computeStreak(
      [
        log('2026-07-12'),
        log('2026-07-13'),
        log('2026-07-14', { output: false }),
        log('2026-07-15'),
      ],
      '2026-07-15',
    )
    expect(s.dayCount).toBe(3)
    expect(s.resets).toBe(0)
  })

  it('resets to 0 after two consecutive failed days', () => {
    const s = computeStreak(
      [
        log('2026-07-10'),
        log('2026-07-11'),
        log('2026-07-12', { reading: false }),
        log('2026-07-13', { output: false }),
        log('2026-07-14'),
        log('2026-07-15'),
      ],
      '2026-07-15',
    )
    expect(s.dayCount).toBe(2) // only the two days after the reset
    expect(s.resets).toBe(1)
    expect(s.totalComplete).toBe(4) // all-time completes still visible in stats
  })

  it('treats days with no row at all as failures', () => {
    // Logged the 10th, vanished for two days, came back the 13th
    const s = computeStreak([log('2026-07-10'), log('2026-07-13')], '2026-07-13')
    expect(s.dayCount).toBe(1)
    expect(s.resets).toBe(1)
  })

  it('never counts today as failed while it is in progress', () => {
    const s = computeStreak(
      [log('2026-07-14'), log('2026-07-15', { journal: '' })],
      '2026-07-15',
    )
    expect(s.dayCount).toBe(1)
    expect(s.atRisk).toBe(false) // yesterday was complete; today is merely pending
    expect(s.history.at(-1)?.status).toBe('pending')
  })

  it('flags atRisk when yesterday failed and today is not yet complete', () => {
    const s = computeStreak(
      [log('2026-07-13'), log('2026-07-14', { output: false })],
      '2026-07-15',
    )
    expect(s.atRisk).toBe(true)
    expect(s.dayCount).toBe(1)
  })

  it('clears atRisk once today is complete', () => {
    const s = computeStreak(
      [log('2026-07-13'), log('2026-07-14', { output: false }), log('2026-07-15')],
      '2026-07-15',
    )
    expect(s.atRisk).toBe(false)
    expect(s.dayCount).toBe(2)
  })

  it('survives fail-recover-fail-recover without resetting', () => {
    const s = computeStreak(
      [
        log('2026-07-10'),
        log('2026-07-11', { reading: false }),
        log('2026-07-12'),
        log('2026-07-13', { reading: false }),
        log('2026-07-14'),
      ],
      '2026-07-14',
    )
    expect(s.dayCount).toBe(3)
    expect(s.resets).toBe(0)
  })

  it('counts a second reset when four days fail in a row', () => {
    const logs = [
      log('2026-07-08'),
      log('2026-07-09', { output: false }),
      log('2026-07-10', { output: false }),
      log('2026-07-11', { output: false }),
      log('2026-07-12', { output: false }),
      log('2026-07-13'),
    ]
    const s = computeStreak(logs, '2026-07-13')
    expect(s.resets).toBe(2)
    expect(s.dayCount).toBe(1)
  })

  it('excludes a pending today from the completion rate', () => {
    const s = computeStreak(
      [log('2026-07-13'), log('2026-07-14'), log('2026-07-15', { journal: '' })],
      '2026-07-15',
    )
    expect(s.completionRate).toBe(1)
  })
})
