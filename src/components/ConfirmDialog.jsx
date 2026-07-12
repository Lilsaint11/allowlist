export default function ConfirmDialog({ entry, onConfirm, onCancel }) {
  if (!entry) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-surface border border-line rounded-sm max-w-sm w-full p-6">
        <h3 className="font-display text-lg text-parchment mb-2">Remove this entry?</h3>
        <p className="text-sm text-muted mb-6">
          <span className="text-parchment">{entry.projectName || 'This entry'}</span> will be
          struck from the ledger. This can't be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-sm border border-line text-muted hover:text-parchment transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm px-4 py-2 rounded-sm bg-rose text-parchment hover:bg-rose/80 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
