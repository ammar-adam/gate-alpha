const MAX_POINTS = 60

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x))
}

export function seedPriceSeries(initialPrice: number, targetModel: number): number[] {
  const out: number[] = [initialPrice]
  let p = initialPrice
  for (let i = 1; i < MAX_POINTS; i++) {
    const drift = (targetModel - p) * 0.08
    const noise = (Math.random() - 0.5) * 0.06
    p = clamp(p + drift + noise, 0.05, 0.95)
    out.push(Math.round(p * 100) / 100)
  }
  return out
}

export function extendPriceSeries(series: number[], targetModel: number): number[] {
  const last = series[series.length - 1] ?? 0.5
  const drift = (targetModel - last) * 0.08
  const noise = (Math.random() - 0.5) * 0.06
  const next = clamp(last + drift + noise, 0.05, 0.95)
  const nextR = Math.round(next * 100) / 100
  const out = [...series, nextR]
  if (out.length > MAX_POINTS) out.shift()
  return out
}
