import { useMemo, useState } from 'react'
import { Masthead } from './Masthead'
import { StatStrip } from './StatStrip'
import { AddPickForm } from './AddPickForm'
import { PicksTable } from './PicksTable'
import { UsedPlayersPanel } from './UsedPlayersPanel'
import { ResetModal } from './ResetModal'
import { SyncBar } from './SyncBar'
import { SyncSettingsModal } from './SyncSettingsModal'
import type { AutoOption } from './Autocomplete'
import { useToast } from '../context/ToastContext'
import { usePicks } from '../hooks/usePicks'
import { formatShortDate } from '../lib/format'
import { TOURNAMENTS } from '../data/tournaments'
import { PLAYERS } from '../data/players'

export function Dashboard() {
  const { showToast } = useToast()
  const {
    picks,
    loading,
    addPick,
    updatePick,
    deletePick,
    resetSeason,
    syncStatus,
    configureSync,
    syncNow,
  } = usePicks()

  const [resetOpen, setResetOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)

  const tournamentOptions: AutoOption[] = useMemo(
    () =>
      TOURNAMENTS.map((t) => ({
        key: t.name,
        name: t.name,
        date: formatShortDate(t.start_date),
        tag: t.tag ?? null,
      })),
    [],
  )

  const playerOptions: AutoOption[] = useMemo(
    () => PLAYERS.map((name) => ({ key: name, name })),
    [],
  )

  const tournamentDateByName = useMemo(
    () => new Map(TOURNAMENTS.map((t) => [t.name.toLowerCase(), t.start_date])),
    [],
  )

  const usedTournaments = useMemo(
    () => new Set(picks.map((p) => p.tournament_name.toLowerCase())),
    [picks],
  )
  const usedPlayers = useMemo(
    () => new Set(picks.map((p) => p.player_name.toLowerCase())),
    [picks],
  )

  function exportJson() {
    const data = picks.map((p) => ({
      tournament: p.tournament_name,
      date: p.tournament_date,
      player: p.player_name,
      finish: p.finish,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pappy-2026-picks.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported')
  }

  async function confirmReset() {
    const { error } = await resetSeason()
    setResetOpen(false)
    showToast(error ? 'Reset failed' : 'Season reset', !!error)
  }

  return (
    <div className="wrap">
      <SyncBar status={syncStatus} onOpen={() => setSyncOpen(true)} />

      <Masthead />

      <StatStrip picks={picks} />

      <div className="section-head">
        <h2 className="section-title">Add a Pick</h2>
        <span className="section-meta">New Entry</span>
      </div>

      <AddPickForm
        tournamentOptions={tournamentOptions}
        playerOptions={playerOptions}
        usedTournaments={usedTournaments}
        usedPlayers={usedPlayers}
        tournamentDateByName={tournamentDateByName}
        onAdd={addPick}
      />

      <div className="section-head">
        <h2 className="section-title">Season Picks</h2>
        <span className="section-meta">
          {loading ? 'Loading…' : `${picks.length} ${picks.length === 1 ? 'Entry' : 'Entries'}`}
        </span>
      </div>

      <PicksTable
        picks={picks}
        tournamentOptions={tournamentOptions}
        playerOptions={playerOptions}
        usedTournaments={usedTournaments}
        usedPlayers={usedPlayers}
        tournamentDateByName={tournamentDateByName}
        onUpdate={updatePick}
        onDelete={deletePick}
        showToast={showToast}
      />

      <UsedPlayersPanel picks={picks} />

      <div className="btn-row" style={{ marginTop: 24, justifyContent: 'space-between' }}>
        <button className="btn ghost" onClick={exportJson}>
          Export JSON
        </button>
        <button className="btn danger" onClick={() => setResetOpen(true)}>
          Reset Season
        </button>
      </div>

      <footer>Pappy &amp; One · MMXXVI · Saved Automatically</footer>

      <ResetModal
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onConfirm={() => void confirmReset()}
      />

      <SyncSettingsModal
        open={syncOpen}
        status={syncStatus}
        onClose={() => setSyncOpen(false)}
        onSave={configureSync}
        onSyncNow={syncNow}
      />
    </div>
  )
}
