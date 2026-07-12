import { Pencil, Trash2, Wallet, Link as LinkIcon, Coins } from 'lucide-react'
import StatusStamp from './StatusStamp'
import { formatCountdown, formatDateLabel } from '../utils/countdown'

export default function WhitelistCard({ entry, onEdit, onDelete }) {
  const countdown = formatCountdown(entry.mintDate)
  const isPast = entry.mintDate && new Date(entry.mintDate).getTime() < Date.now()

  return (
    <div className="relative bg-surface border border-line rounded-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold/70" />

      <div className="pl-6 pr-4 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-widest text-muted uppercase mb-1">
            {entry.chain}
          </p>
          <h3 className="font-display text-xl text-parchment capitalize truncate">
            {entry.projectName || 'Untitled project'}
          </h3>
          {entry.twitterHandle && (
            <p className="text-xs text-muted mt-1">@{entry.twitterHandle.replace(/^@/, '')}</p>
          )}
        </div>
        <StatusStamp status={entry.status} size="sm" />
      </div>

      <div className="pl-6 pr-4 perforated mx-4" />

      <div className="pl-6 pr-4 py-4 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted">{formatDateLabel(entry.mintDate)}</span>
          <span
            className={`font-mono text-sm ${
              isPast ? 'text-muted' : 'text-goldSoft'
            }`}
          >
            {countdown}
          </span>
        </div>

        
          <div className="flex items-center gap-2 text-xs text-muted">
            <Coins size={13} />
            <span>{entry.mintPrice || "TBA" }</span>
          </div>
        {entry.walletUsed && (
          <div className="flex items-center gap-2 text-xs text-muted truncate">
            <Wallet size={13} className="shrink-0" />
            <span className="truncate font-mono">{entry.walletUsed}</span>
          </div>
        )}
          <a
            href={entry.mintLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-gold hover:text-goldSoft transition-colors"
          >
            <LinkIcon size={13} />
            <span className="truncate">{entry.mintLink || "TBA"}</span>
          </a>
        
        {entry.notes && (
          <p className="text-xs text-muted/90 italic pt-1 border-t border-line/60 mt-2">
            {entry.notes}
          </p>
        )}
      </div>

      <div className="pl-6 pr-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => onEdit(entry)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-parchment border border-line rounded-sm py-2 hover:border-gold/60 hover:text-goldSoft transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(entry)}
          className="inline-flex items-center justify-center gap-1.5 text-xs text-muted border border-line rounded-sm py-2 px-3 hover:border-rose/60 hover:text-rose transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
