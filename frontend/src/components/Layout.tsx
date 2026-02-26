import { useState, useEffect } from 'react'
import { SearchBar } from './SearchBar'
import { StatusCard } from './StatusCard'
import { MarketCard, defaultPMkt } from './MarketCard'
import { TradeTicketPortfolio } from './TradeTicketPortfolio'
import { HistoryPanel } from './HistoryPanel'
import { CardSkeleton } from './ui/LoadingSkeleton'
import { ErrorBanner } from './ui/ErrorBanner'
import type { Flight, History, DataSource } from '../api/client'

interface LayoutProps {
  ident: string
  date: string
  mode: 'live' | 'demo'
  onIdentChange: (v: string) => void
  onDateChange: (v: string) => void
  onModeChange: (m: 'live' | 'demo') => void
  onSearch: (ident: string, date: string) => void
  flight: Flight | null
  history: History | null
  dataSource: DataSource
  loading: boolean
  error: string | null
  onDismissError: () => void
}

export function Layout({
  ident,
  date,
  mode,
  onIdentChange,
  onDateChange,
  onModeChange,
  onSearch,
  flight,
  history,
  loading,
  error,
  onDismissError,
}: LayoutProps) {
  const [pMkt, setPMkt] = useState(0.5)

  useEffect(() => {
    if (flight?.prediction != null) {
      setPMkt(defaultPMkt(flight.prediction.p_model_delay_30))
    }
  }, [flight?.ident, flight?.prediction?.p_model_delay_30])

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">GateAlpha</h1>
          <p className="mt-0.5 text-sm text-terminal-muted">
            Flight delay risk · Simulation only (no real trading)
          </p>
        </header>
        <div className="mb-6">
          <SearchBar
            ident={ident}
            date={date}
            mode={mode}
            onIdentChange={onIdentChange}
            onDateChange={onDateChange}
            onModeChange={onModeChange}
            onSearch={onSearch}
            loading={loading}
          />
        </div>
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={onDismissError} />
          </div>
        )}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard flight={flight} />
            <MarketCard flight={flight} pMkt={pMkt} onPMktChange={setPMkt} />
            <TradeTicketPortfolio flight={flight} pMkt={pMkt} />
            <HistoryPanel history={history} />
          </div>
        )}
        <footer className="mt-10 border-t border-terminal-border pt-4 text-center text-xs text-terminal-muted">
          Simulation only. No real trading.
        </footer>
      </div>
    </div>
  )
}
