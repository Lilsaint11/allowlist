import { Search } from 'lucide-react'
import { STATUS, STATUS_ORDER } from '../utils/constants'

export default function FilterBar({ query, onQuery, statusFilter, onStatusFilter, sortAsc, onToggleSort }) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by project name..."
          className="w-full bg-surface border border-line rounded-sm pl-9 pr-3 py-2 text-sm text-parchment placeholder:text-muted focus:border-gold/60 outline-none transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onStatusFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
            statusFilter === 'all'
              ? 'border-gold text-goldSoft bg-gold/10'
              : 'border-line text-muted hover:text-parchment'
          }`}
        >
          All
        </button>
        {STATUS_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => onStatusFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
              statusFilter === key
                ? 'border-gold text-goldSoft bg-gold/10'
                : 'border-line text-muted hover:text-parchment'
            }`}
          >
            {STATUS[key].label}
          </button>
        ))}
        <button
          onClick={onToggleSort}
          className="text-xs px-3 py-1.5 rounded-sm border border-line text-muted hover:text-parchment transition-colors font-mono"
        >
          Date {sortAsc ? '↑' : '↓'}
        </button>
      </div>
    </div>
  )
}
