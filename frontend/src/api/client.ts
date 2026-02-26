export type FlightStatus =
  | 'ON_TIME'
  | 'DELAYED'
  | 'CANCELLED'
  | 'DIVERTED'
  | 'UNKNOWN'

export interface Prediction {
  p_model_delay_30: number
  confidence: string
  reason_codes: string[]
}

export interface Flight {
  ident: string
  airline: string
  origin: string
  destination: string
  carrier_code: string
  flight_number: string
  scheduled_departure: string
  estimated_departure: string
  status: FlightStatus
  delay_minutes: number | null
  last_updated: string
  prediction: Prediction
}

export interface HistoryStats {
  on_time_pct: number
  delay_15_pct: number
  delay_30_pct: number
  cancel_pct: number
}

export interface History {
  origin: string
  destination: string
  carrier: string | null
  stats: HistoryStats
  sample_size: number
  period: string
}

export type DataSource = 'live' | 'demo'

const BASE = '/api'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    let msg = `Request failed`
    try {
      const t = await res.text()
      if (t && t.length < 200) msg = t
      else if (res.status) msg = `Error ${res.status}`
    } catch {
      msg = `Error ${res.status}`
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export async function getFlight(
  ident: string,
  date: string,
  mode: 'live' | 'demo' = 'demo'
): Promise<{ flight: Flight; dataSource: DataSource }> {
  const params = new URLSearchParams({
    ident: ident.trim(),
    date: date.trim().slice(0, 10),
    mode: mode === 'live' ? 'live' : 'demo',
  })
  const res = await fetch(`${BASE}/flight?${params}`)
  if (!res.ok) {
    let msg = `Flight lookup failed`
    try {
      const t = await res.text()
      if (t && t.length < 200) msg = t
    } catch {}
    throw new Error(msg)
  }
  const dataSource = (res.headers.get('X-Data-Source') ?? 'demo') as DataSource
  const flight = (await res.json()) as Flight
  return { flight, dataSource }
}

export function getHistory(
  origin: string,
  destination: string,
  carrier?: string
): Promise<History> {
  const params = new URLSearchParams({
    origin: origin.trim(),
    destination: destination.trim(),
  })
  if (carrier?.trim()) params.set('carrier', carrier.trim())
  return getJson<History>(`${BASE}/history?${params}`)
}
