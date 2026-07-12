import { BookMarked } from 'lucide-react'

export default function EmptyState({ onNew, filtered }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 text-center">
      <BookMarked size={28} className="mx-auto text-gold/70 mb-4" strokeWidth={1.5} />
      <h2 className="font-display text-2xl text-parchment mb-2">
        {filtered ? 'No entries match' : 'The ledger is empty'}
      </h2>
      <p className="text-muted text-sm max-w-sm mx-auto mb-6">
        {filtered
          ? 'Try a different search term or clear your status filter.'
          : 'Log your first whitelist spot — project, chain, mint date — and start keeping the register.'}
      </p>
      {!filtered && (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-gold text-ink font-medium text-sm px-5 py-2.5 rounded-sm hover:bg-goldSoft transition-colors"
        >
          Add first entry
        </button>
      )}
    </div>
  )
}
