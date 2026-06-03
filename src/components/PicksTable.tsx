import { PickRow } from './PickRow'
import type { AutoOption } from './Autocomplete'
import type { Pick } from '../lib/types'
import type { PickPatch } from '../hooks/usePicks'

interface PicksTableProps {
  picks: Pick[]
  tournamentOptions: AutoOption[]
  playerOptions: AutoOption[]
  usedTournaments: Set<string>
  usedPlayers: Set<string>
  tournamentDateByName: Map<string, string | null>
  onUpdate: (id: string, patch: PickPatch) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
  showToast: (message: string, error?: boolean) => void
}

export function PicksTable({
  picks,
  tournamentOptions,
  playerOptions,
  usedTournaments,
  usedPlayers,
  tournamentDateByName,
  onUpdate,
  onDelete,
  showToast,
}: PicksTableProps) {
  return (
    <div className="table-wrap">
      <div className="hint">
        <span className="em">◆</span> Click any cell to edit · Click DELETE twice to remove
      </div>
      <table>
        <thead>
          <tr>
            <th style={{ width: '35%' }}>Tournament</th>
            <th style={{ width: '35%' }}>Player</th>
            <th style={{ width: '15%', textAlign: 'center' }}>Finish</th>
            <th style={{ width: '15%' }}></th>
          </tr>
        </thead>
        <tbody>
          {picks.map((pick) => (
            <PickRow
              key={pick.id}
              pick={pick}
              tournamentOptions={tournamentOptions}
              playerOptions={playerOptions}
              usedTournaments={usedTournaments}
              usedPlayers={usedPlayers}
              tournamentDateByName={tournamentDateByName}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showToast={showToast}
            />
          ))}
        </tbody>
      </table>
      {picks.length === 0 && <div className="empty">No picks recorded yet. Tee it up.</div>}
    </div>
  )
}
