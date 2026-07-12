import { PlusCircle } from 'lucide-react'

export default function Header({ onNew }) {
  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6 flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-gold uppercase mb-2">
            My Personal Register
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment leading-none">
            The Allowlist Ledger
          </h1>
          <p className="text-muted text-sm mt-3 max-w-md">
            Every spot you've earned, entered, or been promised, logged, dated, and
            accounted for.
          </p>
        </div>
        <button
          onClick={onNew}
          className="hidden sm:inline-flex items-center gap-2 bg-gold text-ink font-medium text-sm px-4 py-2.5 rounded-sm hover:bg-goldSoft transition-colors"
        >
          <PlusCircle size={16} strokeWidth={2} />
          New entry
        </button>
      </div>
    </header>
  )
}
