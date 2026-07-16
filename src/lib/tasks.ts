import type { TaskKey } from './streak'

export interface TaskDef {
  key: TaskKey
  label: string
  hint: string
}

export const TASKS: TaskDef[] = [
  { key: 'deep_work_1', label: 'Deep learning session 1', hint: '30–45 min, no distractions' },
  { key: 'deep_work_2', label: 'Deep learning session 2', hint: '30–45 min, no distractions' },
  { key: 'meta_learning', label: 'Meta-learning', hint: '15 min on how you learn' },
  { key: 'output', label: 'Intellectual output', hint: 'produce one thing today' },
  { key: 'reading', label: 'Read 10 pages', hint: 'a real book counts double in spirit' },
  { key: 'no_dopamine', label: 'No low-value dopamine', hint: 'until 5:00 pm' },
]
