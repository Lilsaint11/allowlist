import { STATUS } from '../utils/constants'

export default function StatusStamp({ status, size = 'md' }) {
  const meta = STATUS[status] ?? STATUS.guaranteed
  const dims = size === 'sm' ? 'w-16 h-16 text-[8px] px-1.5' : 'w-20 h-20 text-[9px] px-2'

  return (
    <div
      className={`stamp shrink-0 flex items-center justify-center text-center font-mono font-semibold tracking-widest leading-tight ${dims}`}
      style={{ color: meta.color }}
      aria-label={`Status: ${meta.label}`}
    >
      {meta.stampText}
    </div>
  )
}
