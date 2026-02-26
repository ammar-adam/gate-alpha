import { useState, useEffect } from 'react'
import type { Flight } from '../api/client'
import { seedPriceSeries, extendPriceSeries } from '../lib/chart'

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x))
}

export function defaultPMkt(pModel: number): number {
  return clamp(pModel - 0.08, 0.05, 0.95)
}

interface MarketCardProps {
  flight: Flight | null
  pMkt: number
  onPMktChange: (v: number) => void
}

export function MarketCard({ flight, pMkt, onPMktChange }: MarketCardProps) {
  const pModel = flight?.prediction?.p_model_delay_30 ?? 0.5
  const [priceSeries, setPriceSeries] = useState<number[]>([])

  useEffect(() => {
    if (flight == null) {
      setPriceSeries([])
      return
    }
    setPriceSeries(seedPriceSeries(pMkt, flight.prediction.p_model_delay_30))
  }, [flight?.ident, flight?.prediction?.p_model_delay_30])

  useEffect(() => {
    if (priceSeries.length === 0) return
    const t = setInterval(() => {
      setPriceSeries((s) => extendPriceSeries(s, pModel))
    }, 3000)
    return () => clearInterval(t)
  }, [pModel, priceSeries.length])

  const yesCents = Math.round(pMkt * 100)
  const noCents = 100 - yesCents
  const edgePct = ((pModel - pMkt) * 100).toFixed(1)

  if (!flight) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Market
        </h2>
        <p className="mt-2 text-terminal-muted">Search a flight to see market.</p>
      </div>
    )
  }

  const chartHeight = 80
  const width = 280
  const pts = priceSeries.length ? priceSeries : [pMkt]
  const minP = Math.min(...pts)
  const maxP = Math.max(...pts)
  const range = maxP - minP || 0.1
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1 || 1)) * width
      const y = chartHeight - ((p - minP) / range) * (chartHeight - 4) - 2
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Delay 30+ min?
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <span className="rounded bg-terminal-green/20 px-2 py-0.5 font-mono text-lg font-bold text-terminal-green">
          YES {yesCents}¢
        </span>
        <span className="rounded bg-terminal-red/20 px-2 py-0.5 font-mono text-lg font-bold text-terminal-red">
          NO {noCents}¢
        </span>
        <span className="text-sm text-terminal-muted">
          Edge vs market: <span className="font-mono text-terminal-amber">{(Number(edgePct) >= 0 ? '+' : '') + edgePct}%</span>
        </span>
      </div>
      <div className="mt-2">
        <label className="text-xs text-terminal-muted">Market implied prob (P_mkt)</label>
        <input
          type="range"
          min="5"
          max="95"
          value={Math.round(pMkt * 100)}
          onChange={(e) => onPMktChange(parseInt(e.target.value, 10) / 100)}
          className="mt-0.5 w-full accent-terminal-amber"
        />
        <span className="font-mono text-xs text-terminal-muted">{(pMkt * 100).toFixed(0)}%</span>
      </div>
      {path && (
        <div className="mt-3">
          <p className="text-xs text-terminal-muted">Price (last 60)</p>
          <svg width="100%" viewBox={`0 0 ${width} ${chartHeight}`} className="overflow-hidden rounded">
            <path
              d={path}
              fill="none"
              stroke="var(--color-terminal-amber)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
