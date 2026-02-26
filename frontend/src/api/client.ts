export type FlightStatus =
  | 'ON_TIME'
  | 'DELAYED'
  | 'CANCELLED'
  | 'DIVERTED'
  | 'UNKNOWN'

export interface Prediction {
  p_delay_30: number
  p_mkt: number
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

const BASE = '/api'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function getFlight(ident: string, date: string): Promise<Flight> {
  const params = new URLSearchParams({ ident: ident.trim(), date: date.trim() })
  return getJson<Flight>(`${BASE}/flight?${params}`)
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
