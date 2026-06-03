import { useState } from 'react'
import { Autocomplete, type AutoOption } from './Autocomplete'
import { useToast } from '../context/ToastContext'
import type { NewPick } from '../hooks/usePicks'

interface AddPickFormProps {
  tournamentOptions: AutoOption[]
  playerOptions: AutoOption[]
  usedTournaments: Set<string>
  usedPlayers: Set<string>
  /** name (lowercased) → ISO start date, to stamp tournament_date on add. */
  tournamentDateByName: Map<string, string | null>
  onAdd: (input: NewPick) => Promise<{ error: string | null }>
}

export function AddPickForm({
  tournamentOptions,
  playerOptions,
  usedTournaments,
  usedPlayers,
  tournamentDateByName,
  onAdd,
}: AddPickFormProps) {
  const { showToast } = useToast()
  const [tournament, setTournament] = useState('')
  const [player, setPlayer] = useState('')
  const [finish, setFinish] = useState('')
  const [saving, setSaving] = useState(false)

  function clear() {
    setTournament('')
    setPlayer('')
    setFinish('')
  }

  async function add() {
    const t = tournament.trim()
    const p = player.trim()
    const f = finish.trim()

    if (!t) return showToast('Tournament required', true)
    if (!p) return showToast('Player required', true)
    if (usedTournaments.has(t.toLowerCase())) return showToast(`${t} already picked`, true)
    if (usedPlayers.has(p.toLowerCase())) return showToast(`${p} already used`, true)

    setSaving(true)
    const { error } = await onAdd({
      tournament_name: t,
      tournament_date: tournamentDateByName.get(t.toLowerCase()) ?? null,
      player_name: p,
      finish: f || null,
    })
    setSaving(false)

    if (error) {
      showToast('Save failed', true)
      return
    }
    clear()
    showToast('Pick added')
  }

  return (
    <div className="form-card">
      <div className="form-grid">
        <div className="field">
          <label>Tournament</label>
          <Autocomplete
            value={tournament}
            options={tournamentOptions}
            usedNames={usedTournaments}
            mode="tournament"
            commitMode="change"
            onCommit={setTournament}
            placeholder="Click to browse schedule…"
          />
        </div>
        <div className="field">
          <label>Player</label>
          <Autocomplete
            value={player}
            options={playerOptions}
            usedNames={usedPlayers}
            mode="player"
            commitMode="change"
            onCommit={setPlayer}
            placeholder="Start typing a name…"
          />
        </div>
        <div className="field">
          <label>Finish</label>
          <input
            type="text"
            value={finish}
            placeholder="T12, WIN, MC…"
            autoComplete="off"
            onChange={(e) => setFinish(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void add()
            }}
          />
        </div>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => void add()} disabled={saving}>
          Add Pick
        </button>
        <button className="btn ghost" onClick={clear} disabled={saving}>
          Clear
        </button>
      </div>
    </div>
  )
}
