import { useState, useEffect } from 'react'
import type { Flight } from '../api/client'
import { seedPriceSeries, extendPriceSeries } from '../lib/chart'

interface MarketCardProps {
  flight: Flight | null
}

export function MarketCard({ flight }: MarketCardProps) {
  const pMkt = flight?.prediction?.p_mkt ?? 0.5
  const pModel = flight?.prediction?.p_model_delay_30 ?? 0.5
  const [priceSeries, setPriceSeries] = useState<number[]>([])

  useEffect(() => {
    if (flight == null) {
      setPriceSeries([])
      return
    }
    setPriceSeries(seedPriceSeries(pMkt, pModel))
  }, [flight?.ident, flight?.prediction?.p_mkt, flight?.prediction?.p_model_delay_30])

  useEffect(() => {
    if (priceSeries.length === 0) return
    const t = setInterval(() => {
      setPriceSeries((s) => extendPriceSeries(s, pModel))
    }, 3000)
    return () => clearInterval(t)
  }, [pModel, priceSeries.length])

  const yesCents = Math.round(pMkt * 100)
  const noCents = 100 - yesCents
  const edgeCents = Math.round((pModel - pMkt) * 100)

  if (!flight) {
    return (
      <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-5">
        <h2 className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
          Market
        </h2>
        <p className="mt-2 text-[#666666]">Search a flight to see market.</p>
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
    <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-5">
      <h2 className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
        Will flight {flight.ident} be delayed 30+ min?
      </h2>
      <p className="mt-0.5 text-xs text-[#666666]">
        {flight.origin} → {flight.destination} · {flight.airline}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="rounded bg-[#00d181]/20 px-3 py-1.5 font-mono text-lg font-bold text-[#00d181]">
          YES {yesCents}¢
        </span>
        <span className="rounded bg-[#ff4444]/20 px-3 py-1.5 font-mono text-lg font-bold text-[#ff4444]">
          NO {noCents}¢
        </span>
      </div>
      <p className="mt-2 text-xs text-[#666666]">
        Model: {Math.round(pModel * 100)}% · Market: {yesCents}% · Edge: {edgeCents >= 0 ? '+' : ''}{edgeCents}¢
      </p>
      <p className="mt-0.5 text-xs text-[#999999]">Volume: 2,847 contracts · OI: 1,203</p>
      {path && (
        <div className="mt-3">
          <svg width="100%" viewBox={`0 0 ${width} ${chartHeight}`} className="overflow-hidden rounded">
            <path
              d={path}
              fill="none"
              stroke="#f5a623"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
