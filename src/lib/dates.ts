/** Today as 'YYYY-MM-DD' in the user's local timezone. The challenge day
 * boundary is local midnight, so this must NOT use toISOString(), which
 * would flip to the next day at UTC midnight instead. */
export function localToday(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
