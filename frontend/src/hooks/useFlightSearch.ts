import { useState, useCallback } from 'react'
import { getFlight, getHistory, type Flight, type History } from '../api/client'

const DEMO_IDENT = 'UA4469'
const DEMO_DATE = '2026-02-25'

const DEMO_FLIGHT: Flight = {
  ident: 'UA4469',
  airline: 'United Airlines',
  origin: 'EWR',
  destination: 'BTV',
  carrier_code: 'UA',
  flight_number: '4469',
  scheduled_departure: '2026-02-25T08:30:00Z',
  estimated_departure: '2026-02-25T09:17:00Z',
  status: 'DELAYED',
  delay_minutes: 47,
  last_updated: '2026-02-25T08:12:00Z',
  prediction: {
    p_delay_30: 0.67,
    p_mkt: 0.59,
    confidence: 'MED',
    reason_codes: ['LATE_INBOUND', 'AIRPORT_CONGESTION'],
  },
}

const DEMO_HISTORY: History = {
  origin: 'EWR',
  destination: 'BTV',
  carrier: 'UA',
  stats: { on_time_pct: 0.72, delay_15_pct: 0.21, delay_30_pct: 0.14, cancel_pct: 0.03 },
  sample_size: 842,
  period: '2025-01 to 2025-12',
}

export interface UseFlightSearchState {
  ident: string
  date: string
  flight: Flight | null
  history: History | null
  loading: boolean
  error: string | null
  demoMode: boolean
}

export function useFlightSearch() {
  const [ident, setIdent] = useState('')
  const [date, setDate] = useState('')
  const [flight, setFlight] = useState<Flight | null>(null)
  const [history, setHistory] = useState<History | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  const search = useCallback(async (searchIdent: string, searchDate: string) => {
    const i = searchIdent.trim()
    const d = searchDate.trim()
    if (!i || !d) return
    setLoading(true)
    setError(null)
    setDemoMode(false)
    try {
      const f = await getFlight(i, d)
      setFlight(f)
      setIdent(i)
      setDate(d)
      try {
        const h = await getHistory(f.origin, f.destination, f.carrier_code)
        setHistory(h)
      } catch {
        setHistory({
          origin: f.origin,
          destination: f.destination,
          carrier: f.carrier_code,
          stats: {
            on_time_pct: 0,
            delay_15_pct: 0,
            delay_30_pct: 0,
            cancel_pct: 0,
          },
          sample_size: 0,
          period: '—',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setDemoMode(true)
      setFlight(DEMO_FLIGHT)
      setHistory(DEMO_HISTORY)
      setIdent(DEMO_IDENT)
      setDate(DEMO_DATE)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    ident,
    date,
    flight,
    history,
    loading,
    error,
    demoMode,
    search,
    setIdent,
    setDate,
    clearError,
  }
}
