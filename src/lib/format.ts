// Display helpers.

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Format an ISO date (YYYY-MM-DD) as the prototype's short label, e.g.
 * "2026-01-18" → "Jan 18". Parsed manually to avoid timezone drift.
 */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return ''
  const month = MONTHS[Number(m[2]) - 1]
  const day = Number(m[3])
  return month ? `${month} ${day}` : ''
}
