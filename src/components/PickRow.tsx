import { useEffect, useRef, useState } from 'react'
import { Autocomplete, type AutoOption } from './Autocomplete'
import { finishClass } from '../lib/finish'
import type { Pick } from '../lib/types'
import type { PickPatch } from '../hooks/usePicks'

interface PickRowProps {
  pick: Pick
  tournamentOptions: AutoOption[]
  playerOptions: AutoOption[]
  usedTournaments: Set<string>
  usedPlayers: Set<string>
  tournamentDateByName: Map<string, string | null>
  onUpdate: (id: string, patch: PickPatch) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
  showToast: (message: string, error?: boolean) => void
}

export function PickRow({
  pick,
  tournamentOptions,
  playerOptions,
  usedTournaments,
  usedPlayers,
  tournamentDateByName,
  onUpdate,
  onDelete,
  showToast,
}: PickRowProps) {
  const [finishDraft, setFinishDraft] = useState(pick.finish ?? '')
  const [confirm, setConfirm] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setFinishDraft(pick.finish ?? '')
  }, [pick.finish])

  useEffect(() => () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
  }, [])

  async function commitTournament(name: string) {
    if (name === pick.tournament_name) return
    const { error } = await onUpdate(pick.id, {
      tournament_name: name,
      tournament_date: tournamentDateByName.get(name.toLowerCase()) ?? null,
    })
    showToast(error ? 'Save failed' : 'Tournament updated', !!error)
  }

  async function commitPlayer(name: string) {
    if (name === pick.player_name) return
    const { error } = await onUpdate(pick.id, { player_name: name })
    showToast(error ? 'Save failed' : 'Player updated', !!error)
  }

  async function commitFinish() {
    const next = finishDraft.trim()
    if (next === (pick.finish ?? '')) return
    const { error } = await onUpdate(pick.id, { finish: next || null })
    showToast(error ? 'Save failed' : 'Finish updated', !!error)
  }

  function handleDelete() {
    if (confirm) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
      setConfirm(false)
      void onDelete(pick.id).then(({ error }) =>
        showToast(error ? 'Delete failed' : 'Pick removed', !!error),
      )
    } else {
      setConfirm(true)
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
      confirmTimer.current = setTimeout(() => setConfirm(false), 3000)
    }
  }

  return (
    <tr>
      <td className="tournament-cell">
        <Autocomplete
          value={pick.tournament_name}
          options={tournamentOptions}
          usedNames={usedTournaments}
          mode="tournament"
          commitMode="blur"
          onCommit={(name) => void commitTournament(name)}
          inputClassName="cell-input tournament"
        />
      </td>
      <td className="player-cell">
        <Autocomplete
          value={pick.player_name}
          options={playerOptions}
          usedNames={usedPlayers}
          mode="player"
          commitMode="blur"
          onCommit={(name) => void commitPlayer(name)}
          inputClassName="cell-input player"
        />
      </td>
      <td>
        <input
          className={`cell-input finish ${finishClass(finishDraft)}`}
          value={finishDraft}
          placeholder="—"
          onChange={(e) => setFinishDraft(e.target.value)}
          onBlur={() => void commitFinish()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
        />
      </td>
      <td className="row-actions">
        <button
          type="button"
          className={`del-btn${confirm ? ' confirm' : ''}`}
          onClick={handleDelete}
        >
          {confirm ? 'Confirm?' : 'Delete'}
        </button>
      </td>
    </tr>
  )
}
