import type { Pick } from '../lib/types'

export function UsedPlayersPanel({ picks }: { picks: Pick[] }) {
  const players = picks
    .filter((p) => p.player_name)
    .map((p) => p.player_name)
    .sort((a, b) => a.localeCompare(b))

  return (
    <div className="used-panel">
      <div className="section-meta" style={{ color: 'var(--ink-soft)' }}>
        Players Used · Locked
      </div>
      <div className="used-list">
        {players.length === 0 ? (
          <span className="used-empty">No players locked yet.</span>
        ) : (
          players.map((name) => (
            <span key={name} className="used-chip">
              {name}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
