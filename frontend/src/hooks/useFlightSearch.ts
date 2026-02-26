import { useState, useCallback } from 'react'
import { getFlight, getHistory, type Flight, type History, type DataSource } from '../api/client'

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
    p_model_delay_30: 0.67,
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
  period: '2024-01 to 2024-12',
}

export interface UseFlightSearchState {
  ident: string
  date: string
  flight: Flight | null
  history: History | null
  dataSource: DataSource
  mode: 'live' | 'demo'
  loading: boolean
  error: string | null
}

export function useFlightSearch() {
  const [ident, setIdent] = useState('')
  const [date, setDate] = useState('')
  const [flight, setFlight] = useState<Flight | null>(null)
  const [history, setHistory] = useState<History | null>(null)
  const [dataSource, setDataSource] = useState<DataSource>('demo')
  const [mode, setMode] = useState<'live' | 'demo'>('demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (searchIdent: string, searchDate: string) => {
      const i = searchIdent.trim()
      const d = searchDate.trim().slice(0, 10)
      if (!i || !d) return
      setLoading(true)
      setError(null)
      try {
        const { flight: f, dataSource: ds } = await getFlight(i, d, mode)
        setFlight(f)
        setDataSource(ds)
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
            stats: { on_time_pct: 0, delay_15_pct: 0, delay_30_pct: 0, cancel_pct: 0 },
            sample_size: 0,
            period: '—',
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'ERROR'
        setError(message === 'NOT_FOUND' ? 'Flight not found · showing demo data' : 'Something went wrong · showing demo data')
        setFlight(DEMO_FLIGHT)
        setHistory(DEMO_HISTORY)
        setDataSource('demo')
        setIdent(DEMO_IDENT)
        setDate(DEMO_DATE)
      } finally {
        setLoading(false)
      }
    },
    [mode]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    ident,
    date,
    flight,
    history,
    dataSource,
    mode,
    loading,
    error,
    search,
    setIdent,
    setDate,
    setMode,
    clearError,
  }
}
