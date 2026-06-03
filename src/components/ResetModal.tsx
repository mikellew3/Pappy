interface ResetModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ResetModal({ open, onCancel, onConfirm }: ResetModalProps) {
  return (
    <div className={`modal-back${open ? ' open' : ''}`} onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Reset Entire Season?</h3>
        <p>
          This will delete all picks and cannot be undone. Consider exporting your JSON first.
        </p>
        <div className="btn-row">
          <button className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn danger" onClick={onConfirm}>
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  )
}
