import { useEffect, useState } from 'react'
import type { SyncStatus } from '../hooks/usePicks'
import { getSyncConfig, clearSyncConfig } from '../lib/sync'

interface SyncSettingsModalProps {
  open: boolean
  status: SyncStatus
  onClose: () => void
  onSave: (url: string, secret: string) => void
  onSyncNow: () => void
}

const STATUS_NOTE: Record<SyncStatus, string> = {
  disabled: 'Sync is off — picks are saved on this device only.',
  syncing: 'Syncing with the cloud…',
  synced: 'Up to date across your devices.',
  offline: 'Can’t reach the sync server right now. Changes are saved locally and will retry.',
  unauthorized: 'The passphrase was rejected. Check it matches your Worker secret.',
}

export function SyncSettingsModal({
  open,
  status,
  onClose,
  onSave,
  onSyncNow,
}: SyncSettingsModalProps) {
  const [url, setUrl] = useState('')
  const [secret, setSecret] = useState('')

  // Prefill from stored config each time the modal opens.
  useEffect(() => {
    if (open) {
      const cfg = getSyncConfig()
      setUrl(cfg.url)
      setSecret(cfg.secret)
    }
  }, [open])

  function save() {
    onSave(url.trim(), secret.trim())
    onClose()
  }

  function disable() {
    clearSyncConfig()
    onSave('', '')
    onClose()
  }

  return (
    <div className={`modal-back${open ? ' open' : ''}`} onClick={onClose}>
      <div className="modal sync-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Cloud Sync</h3>
        <p style={{ marginBottom: 16 }}>{STATUS_NOTE[status]}</p>

        <div className="field" style={{ textAlign: 'left' }}>
          <label>Worker URL</label>
          <input
            type="url"
            value={url}
            placeholder="https://pappy-sync.your-name.workers.dev"
            autoComplete="off"
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="field" style={{ textAlign: 'left', marginTop: 12 }}>
          <label>Passphrase</label>
          <input
            type="password"
            value={secret}
            placeholder="your shared secret"
            autoComplete="off"
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>

        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn ghost" onClick={onSyncNow}>
            Sync Now
          </button>
          <button className="btn" onClick={save}>
            Save
          </button>
        </div>
        <button className="sync-disable" onClick={disable}>
          Turn off sync on this device
        </button>
      </div>
    </div>
  )
}
