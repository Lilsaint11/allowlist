export function getCountdownParts(targetIso) {
  if (!targetIso) return null
  const target = new Date(targetIso).getTime()
  const now = Date.now()
  const diff = target - now
  const isPast = diff < 0
  const abs = Math.abs(diff)

  const days = Math.floor(abs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((abs / (1000 * 60)) % 60)

  return { days, hours, minutes, isPast }
}

export function formatCountdown(targetIso) {
  const parts = getCountdownParts(targetIso)
  if (!parts) return '— no date set —'
  const { days, hours, minutes, isPast } = parts

  if (isPast) {
    if (days === 0 && hours === 0) return 'minting now'
    if (days === 0) return `${hours}h elapsed`
    return `${days}d elapsed`
  }

  if (days > 0) return `T-minus ${days}d ${hours}h`
  if (hours > 0) return `T-minus ${hours}h ${minutes}m`
  return `T-minus ${minutes}m`
}

export function formatDateLabel(targetIso) {
  if (!targetIso) return 'No mint date set'
  const d = new Date(targetIso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
