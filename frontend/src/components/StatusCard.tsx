import type { Flight } from '../api/client'

const STATUS_LABELS: Record<string, string> = {
  ON_TIME: 'On Time',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled',
  DIVERTED: 'Diverted',
  UNKNOWN: 'Unknown',
}

const STATUS_CLASS: Record<string, string> = {
  ON_TIME: 'bg-terminal-green/20 text-terminal-green border-terminal-green/50',
  DELAYED: 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber/50',
  CANCELLED: 'bg-terminal-red/20 text-terminal-red border-terminal-red/50',
  DIVERTED: 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber/50',
  UNKNOWN: 'bg-terminal-muted/20 text-terminal-muted border-terminal-muted/50',
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return iso
  }
}

interface StatusCardProps {
  flight: Flight | null
}

export function StatusCard({ flight }: StatusCardProps) {
  if (!flight) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Status
        </h2>
        <p className="mt-2 text-terminal-muted">Search a flight to see status.</p>
      </div>
    )
  }

  const statusClass = STATUS_CLASS[flight.status] ?? STATUS_CLASS.UNKNOWN
  const label = STATUS_LABELS[flight.status] ?? flight.status

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Status
      </h2>
      <div className="mt-3 flex items-center gap-3">
        <span className={`rounded border px-2.5 py-1 text-sm font-semibold ${statusClass}`}>
          {label}
        </span>
        {flight.delay_minutes != null && flight.delay_minutes > 0 && (
          <span className="text-2xl font-bold tabular-nums text-terminal-amber">
            +{flight.delay_minutes} min
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-terminal-muted">Scheduled dep.</span>
          <span className="font-mono tabular-nums">{formatTime(flight.scheduled_departure)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-muted">Estimated dep.</span>
          <span className="font-mono tabular-nums">{formatTime(flight.estimated_departure)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-terminal-muted">Last updated</span>
          <span className="font-mono text-terminal-muted">{formatTime(flight.last_updated)}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-terminal-muted">
        {flight.airline} · {flight.origin} → {flight.destination}
      </p>
    </div>
  )
}
