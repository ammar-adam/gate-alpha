import type { Prediction } from '../api/client'

const REASON_DISPLAY: Record<string, string> = {
  LATE_INBOUND: 'Late inbound',
  AIRPORT_CONGESTION: 'Airport congestion',
  WINTER_OPS: 'Winter ops',
  BASELINE_ROUTE_RISK: 'Route baseline',
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
      <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-5">
        <h2 className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
          Delay probability (30+ min)
        </h2>
        <p className="mt-2 text-[#666666]">Search a flight to see probability.</p>
      </div>
    )
  }

  const modelPct = Math.round(prediction.p_model_delay_30 * 100)
  const mktCents = Math.round(prediction.p_mkt * 100)
  const edgeCents = modelPct - mktCents

  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-5">
      <h2 className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
        Delay probability (30+ min)
      </h2>
      <p className="mt-2 font-bold tabular-nums text-[#f5a623]" style={{ fontSize: '2.5rem' }}>
        {modelPct}%
      </p>
      <p className="mt-1 text-sm text-[#666666]">
        Model: {modelPct}¢ · Market: {mktCents}¢ · Edge {edgeCents >= 0 ? '+' : ''}{edgeCents}¢
      </p>
      <p className="mt-0.5 text-xs text-[#999999]">Confidence: {prediction.confidence}</p>
      {prediction.reason_codes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prediction.reason_codes.map((code) => (
            <span
              key={code}
              className="rounded border border-[#1f1f1f] bg-[#0a0a0a] px-2 py-0.5 text-xs text-[#666666]"
            >
              {reasonLabel(code)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
