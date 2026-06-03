import type { SyncStatus } from '../hooks/usePicks'

const LABELS: Record<SyncStatus, string> = {
  disabled: 'Local only',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline',
  unauthorized: 'Check passphrase',
}

export function SyncBar({ status, onOpen }: { status: SyncStatus; onOpen: () => void }) {
  return (
    <div className="sync-bar">
      <button type="button" className={`sync-pill sync-${status}`} onClick={onOpen}>
        <span className="sync-dot" />
        {LABELS[status]}
      </button>
    </div>
  )
}
