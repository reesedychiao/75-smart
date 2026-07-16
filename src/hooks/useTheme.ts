import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = '75smart-theme'

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'system',
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && mq.matches)
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }
    apply()
    // In system mode, keep following the OS if it changes while the app is open.
    if (mode === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [mode])

  const cycle = () =>
    setMode((m) => (m === 'system' ? 'light' : m === 'light' ? 'dark' : 'system'))

  return { mode, cycle }
}
