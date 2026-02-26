import type { Prediction, DataSource } from '../api/client'

const REASON_DISPLAY: Record<string, string> = {
  LATE_INBOUND: 'Late inbound',
  AIRPORT_CONGESTION: 'Airport congestion',
  WINTER_OPS: 'Winter ops',
  ROUTE_HISTORY_BASELINE: 'Route history',
  WEATHER: 'Weather',
  CREW_TIMEOUT: 'Crew timeout',
  CURRENT_DELAY: 'Current delay',
}

function reasonLabel(code: string): string {
  return REASON_DISPLAY[code] ?? code.replace(/_/g, ' ').toLowerCase()
}

interface ProbabilityCardProps {
  prediction: Prediction | null
  dataSource?: DataSource
  flash?: boolean
}

export function ProbabilityCard({
  prediction,
  dataSource = 'mock',
  flash = false,
}: ProbabilityCardProps) {
  if (!prediction) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Delay probability (30+ min)
        </h2>
        <p className="mt-2 text-terminal-muted">Search a flight to see probability.</p>
      </div>
    )
  }

  const modelPct = Math.round(prediction.p_delay_30 * 100)
  const mktPct = Math.round(prediction.p_mkt * 100)
  const edgePct = modelPct - mktPct

  return (
    <div
      className={`rounded-lg border border-terminal-border bg-terminal-surface p-5 transition-all duration-300 ${
        flash ? 'ring-2 ring-terminal-amber/60' : ''
      }`}
    >
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Delay probability (30+ min)
      </h2>
      <p className="mt-2 text-4xl font-bold tabular-nums text-terminal-amber">
        {modelPct}%
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-sm text-terminal-muted">
          Model: {modelPct}% vs Market: {mktPct}% → Edge {edgePct >= 0 ? '+' : ''}{edgePct}%
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${
            dataSource === 'live'
              ? 'bg-terminal-green/20 text-terminal-green'
              : 'bg-terminal-muted/20 text-terminal-muted'
          }`}
        >
          {dataSource === 'live' ? 'LIVE' : 'MOCK'}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-terminal-muted">
        Confidence: {prediction.confidence}
      </p>
      {dataSource === 'live' && (
        <p className="mt-0.5 text-xs text-terminal-muted">Powered by FlightAware</p>
      )}
      {prediction.reason_codes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prediction.reason_codes.map((code) => (
            <span
              key={code}
              className="rounded border border-terminal-border bg-terminal-bg px-2 py-0.5 text-xs text-terminal-muted"
            >
              {reasonLabel(code)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
