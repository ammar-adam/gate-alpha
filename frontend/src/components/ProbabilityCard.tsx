import type { Prediction } from '../api/client'

const REASON_DISPLAY: Record<string, string> = {
  LATE_INBOUND: 'Late inbound',
  AIRPORT_CONGESTION: 'Airport congestion',
  WINTER_OPS: 'Winter ops',
  ROUTE_HISTORY_BASELINE: 'Route history',
  WEATHER: 'Weather',
  CREW_TIMEOUT: 'Crew timeout',
}

function reasonLabel(code: string): string {
  return REASON_DISPLAY[code] ?? code.replace(/_/g, ' ').toLowerCase()
}

interface ProbabilityCardProps {
  prediction: Prediction | null
}

export function ProbabilityCard({ prediction }: ProbabilityCardProps) {
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
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Delay probability (30+ min)
      </h2>
      <p className="mt-2 text-4xl font-bold tabular-nums text-terminal-amber">
        {modelPct}%
      </p>
      <p className="mt-1 text-sm text-terminal-muted">
        Model: {modelPct}% vs Market: {mktPct}% → Edge {edgePct >= 0 ? '+' : ''}{edgePct}%
      </p>
      <p className="mt-0.5 text-xs text-terminal-muted">
        Confidence: {prediction.confidence}
      </p>
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
