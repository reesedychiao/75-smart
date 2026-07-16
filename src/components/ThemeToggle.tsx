import { useTheme, type ThemeMode } from '../hooks/useTheme'

const LABELS: Record<ThemeMode, string> = {
  light: 'light',
  dark: 'dark',
  system: 'auto',
}

function Icon({ mode }: { mode: ThemeMode }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const
  if (mode === 'light') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
      </svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...common}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M9 21h6m-3-4v4" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { mode, cycle } = useTheme()
  return (
    <button
      onClick={cycle}
      title={`Theme: ${LABELS[mode]} — click to change`}
      aria-label={`Theme: ${LABELS[mode]}. Click to change.`}
      className="flex items-center gap-1.5 text-ink-400 transition hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-200"
    >
      <Icon mode={mode} />
      <span className="text-xs">{LABELS[mode]}</span>
    </button>
  )
}
