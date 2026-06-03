import type { Pick } from '../lib/types'
import { isMcWd, isTop10, isWin } from '../lib/finish'

export function StatStrip({ picks }: { picks: Pick[] }) {
  const count = picks.length
  const wins = picks.filter((p) => isWin(p.finish)).length
  const top10 = picks.filter((p) => isTop10(p.finish)).length
  const mc = picks.filter((p) => isMcWd(p.finish)).length

  return (
    <section className="stats">
      <div className="stat">
        <div className="stat-label">Picks Made</div>
        <div className="stat-value">{count}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Wins</div>
        <div className="stat-value gold">{wins}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Top 10s</div>
        <div className="stat-value">{top10}</div>
      </div>
      <div className="stat">
        <div className="stat-label">MC / WD</div>
        <div className="stat-value red">{mc}</div>
      </div>
    </section>
  )
}
