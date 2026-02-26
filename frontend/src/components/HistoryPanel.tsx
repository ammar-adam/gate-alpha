import type { History } from '../api/client'

interface HistoryPanelProps {
  history: History | null
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  if (!history) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Historical stats
        </h2>
        <p className="mt-2 text-terminal-muted">Search a flight to see route history.</p>
      </div>
    )
  }

  const hasData = history.sample_size > 0

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Historical stats
      </h2>
      {!hasData ? (
        <p className="mt-2 text-terminal-muted">
          {history.origin && history.destination
            ? `Insufficient data for ${history.origin} → ${history.destination}.`
            : 'Insufficient data for this route.'}
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-terminal-muted">
            {history.origin} → {history.destination}
            {history.carrier ? ` · ${history.carrier}` : ''} · n={history.sample_size} · {history.period}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold tabular-nums text-terminal-green">
                {pct(history.stats.on_time_pct)}
              </p>
              <p className="text-xs text-terminal-muted">On-time</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-terminal-amber">
                {pct(history.stats.delay_15_pct)}
              </p>
              <p className="text-xs text-terminal-muted">15+ min delay</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-terminal-amber">
                {pct(history.stats.delay_30_pct)}
              </p>
              <p className="text-xs text-terminal-muted">30+ min delay</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-terminal-red">
                {pct(history.stats.cancel_pct)}
              </p>
              <p className="text-xs text-terminal-muted">Cancellation</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
