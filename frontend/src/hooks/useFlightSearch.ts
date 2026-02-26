import { useState, useCallback, useEffect, useRef } from 'react'
import {
  getFlight,
  getHistory,
  getMarket,
  type Flight,
  type History,
  type Market,
  type DataSource,
} from '../api/client'

const POLL_INTERVAL_MS = 60_000

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
  market: Market | null
  dataSource: DataSource
  loading: boolean
  error: string | null
  demoMode: boolean
  lastFetchedAt: number | null
  probabilityFlash: boolean
}

export function useFlightSearch() {
  const [ident, setIdent] = useState('')
  const [date, setDate] = useState('')
  const [flight, setFlight] = useState<Flight | null>(null)
  const [history, setHistory] = useState<History | null>(null)
  const [market, setMarket] = useState<Market | null>(null)
  const [dataSource, setDataSource] = useState<DataSource>('mock')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null)
  const [probabilityFlash, setProbabilityFlash] = useState(false)
  const prevPRef = useRef<number | null>(null)

  const refreshFlight = useCallback(async (i: string, d: string) => {
    try {
      const { flight: f, dataSource: ds } = await getFlight(i, d)
      const prevP = prevPRef.current
      prevPRef.current = f.prediction.p_delay_30
      if (prevP != null && Math.abs(prevP - f.prediction.p_delay_30) > 0.001) {
        setProbabilityFlash(true)
        setTimeout(() => setProbabilityFlash(false), 1500)
      }
      setFlight(f)
      setDataSource(ds)
      setLastFetchedAt(Date.now())
      try {
        const m = await getMarket(i, d)
        setMarket(m)
      } catch {
        setMarket(null)
      }
    } catch {
      // keep existing data on poll failure
    }
  }, [])

  useEffect(() => {
    if (!ident || !date || !flight || flight.status === 'CANCELLED' || demoMode) return
    const id = setInterval(() => refreshFlight(ident, date), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [ident, date, flight?.status, demoMode, refreshFlight])

  const search = useCallback(async (searchIdent: string, searchDate: string) => {
    const i = searchIdent.trim()
    const d = searchDate.trim()
    if (!i || !d) return
    setLoading(true)
    setError(null)
    setDemoMode(false)
    try {
      const { flight: f, dataSource: ds } = await getFlight(i, d)
      setFlight(f)
      setDataSource(ds)
      setIdent(i)
      setDate(d)
      setLastFetchedAt(Date.now())
      prevPRef.current = f.prediction.p_delay_30
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
      try {
        const m = await getMarket(i, d)
        setMarket(m)
      } catch {
        setMarket(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setDemoMode(true)
      setFlight(DEMO_FLIGHT)
      setHistory(DEMO_HISTORY)
      setDataSource('mock')
      setMarket(null)
      setLastFetchedAt(null)
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
    market,
    dataSource,
    loading,
    error,
    demoMode,
    lastFetchedAt,
    probabilityFlash,
    search,
    setIdent,
    setDate,
    clearError,
  }
}
