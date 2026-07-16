import type { Quote } from '../lib/quotes'

export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <figure className="px-2 text-center">
      <blockquote className="font-display text-lg font-light leading-relaxed text-ink-700 dark:text-ink-300">
        “{quote.text}”
      </blockquote>
      <figcaption className="mt-3 text-xs uppercase tracking-[0.2em] text-ink-400 dark:text-ink-500">
        {quote.author}
      </figcaption>
    </figure>
  )
}
