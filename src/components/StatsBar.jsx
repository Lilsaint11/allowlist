export default function StatsBar({ entries }) {
  const now = Date.now()
  const upcoming = entries.filter((e) => e.mintDate && new Date(e.mintDate).getTime() > now)
  const withinWeek = upcoming.filter(
    (e) => new Date(e.mintDate).getTime() - now < 7 * 24 * 60 * 60 * 1000,
  )
  const guaranteed = entries.filter((e) => e.status === 'guaranteed' || e.status === 'confirmed')

  const stats = [
    { label: 'Total tracked', value: entries.length },
    { label: 'Upcoming mints', value: upcoming.length },
    { label: 'Minting this week', value: withinWeek.length },
    { label: 'Secured spots', value: guaranteed.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-line mb-5">
      {stats.map((s) => (
        <div key={s.label} className="bg-ink px-4 py-3">
          <p className="font-mono text-2xl text-parchment">{s.value}</p>
          <p className="text-[11px] uppercase tracking-wider text-muted mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
