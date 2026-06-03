// Finish-string interpretation. Free-text like "T12", "WIN", "MC", "5", "WD".
// Ported from the prototype so the stats + auto-colors match exactly.

export type FinishClass = '' | 'finish-win' | 'finish-top10' | 'finish-mc'

export function isWin(finish: string | null | undefined): boolean {
  if (!finish) return false
  const u = finish.toUpperCase().trim()
  return u === 'WIN' || u === '1' || u === '1ST'
}

export function isTop10(finish: string | null | undefined): boolean {
  if (!finish) return false
  const u = finish.toUpperCase().trim()
  if (u === 'WIN') return true
  const n = parseInt(u.replace(/[T]/g, ''), 10)
  return !Number.isNaN(n) && n <= 10
}

export function isMcWd(finish: string | null | undefined): boolean {
  if (!finish) return false
  const u = finish.toUpperCase().trim()
  return u === 'MC' || u === 'CUT' || u === 'WD' || u === 'DQ'
}

/** Class used to auto-color a finish cell: gold / green / red / none. */
export function finishClass(finish: string | null | undefined): FinishClass {
  if (!finish) return ''
  const f = finish.toUpperCase().trim()
  if (f === 'WIN' || f === '1' || f === '1ST') return 'finish-win'
  if (f === 'MC' || f === 'CUT' || f === 'WD' || f === 'DQ') return 'finish-mc'
  const num = parseInt(f.replace(/[T]/g, ''), 10)
  if (!Number.isNaN(num) && num <= 10) return 'finish-top10'
  return ''
}
