import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onSave: (journal: string) => void
}

export default function JournalEditor({ value, onSave }: Props) {
  const [text, setText] = useState(value)
  const [saved, setSaved] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const latest = useRef(text)
  latest.current = text

  // Adopt server value only when we have no unsaved edits (e.g. first load,
  // or the same journal edited from another device).
  useEffect(() => {
    if (saved) setText(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function handleChange(next: string) {
    setText(next)
    setSaved(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onSave(latest.current)
      setSaved(true)
    }, 800)
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
          Journal
        </h2>
        <span className="text-xs text-ink-300 transition dark:text-ink-600">
          {saved ? (text.trim() ? 'saved' : '') : 'saving…'}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={5}
        placeholder="What did you learn today? What did you make?"
        className="w-full resize-y bg-transparent text-sm leading-relaxed text-ink-800 outline-none placeholder:text-ink-300 dark:text-ink-200 dark:placeholder:text-ink-600"
      />
    </section>
  )
}
