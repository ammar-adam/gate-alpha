import { useState, useEffect, useCallback } from 'react'
import { SearchBar } from './SearchBar'
import { PopularFlights } from './PopularFlights'
import { StatusCard } from './StatusCard'
import { MarketCard } from './MarketCard'
import { ProbabilityCard } from './ProbabilityCard'
import { TradeTicketPortfolio } from './TradeTicketPortfolio'
import { HistoryPanel } from './HistoryPanel'
import { CardSkeleton } from './ui/LoadingSkeleton'
import { ErrorBanner } from './ui/ErrorBanner'
import type { Flight, History, DataSource } from '../api/client'
import { getSearchResults, type SearchResultItem } from '../api/client'
import type { Position } from '../types/portfolio'

interface LayoutProps {
  userName: string
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
  credits: number
  positions: Position[]
  onAddPosition: (flight_ident: string, side: 'YES' | 'NO', contracts: number, price_cents: number) => void
  onClosePosition: (id: string, refund: number) => void
}

export function Layout({
  userName,
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
  credits,
  positions,
  onAddPosition,
  onClosePosition,
}: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const t = setTimeout(() => {
      getSearchResults(searchQuery).then(setSearchResults).catch(() => setSearchResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const today = new Date().toISOString().slice(0, 10)
  const handlePopularSelect = useCallback(
    (flightIdent: string) => {
      onIdentChange(flightIdent)
      onDateChange(today)
      onSearch(flightIdent, today)
    },
    [onIdentChange, onDateChange, onSearch]
  )
  const handleSelectSearchResult = useCallback(
    (flightIdent: string) => {
      onIdentChange(flightIdent)
      onDateChange(today)
      onSearch(flightIdent, today)
      setSearchQuery('')
      setSearchResults([])
    },
    [onIdentChange, onDateChange, onSearch]
  )

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">GateAlpha</h1>
            <p className="mt-0.5 text-xs text-[#666666]">
              Simulation only · No real trading
            </p>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-[#999999]">Hi, {userName} ·</span>
            )}
            <span className="rounded-full bg-[#111111] px-3 py-1.5 font-mono text-sm font-semibold text-[#00d181]">
              {credits.toFixed(0)} credits
            </span>
            {mode === 'demo' && (
              <span className="rounded bg-[#f5a623]/20 px-2 py-0.5 text-xs font-medium uppercase text-[#f5a623]">
                Demo
              </span>
            )}
          </div>
        </header>
        <div className="mb-4">
          <SearchBar
            ident={ident}
            date={date}
            mode={mode}
            onIdentChange={onIdentChange}
            onDateChange={onDateChange}
            onModeChange={onModeChange}
            onSearch={onSearch}
            loading={loading}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchResults={searchResults}
            onSelectSearchResult={handleSelectSearchResult}
          />
        </div>
        <PopularFlights onSelect={handlePopularSelect} />
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
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <StatusCard flight={flight} />
              <ProbabilityCard prediction={flight?.prediction ?? null} />
              <MarketCard flight={flight} />
            </div>
            <div className="space-y-4">
              <TradeTicketPortfolio
                flight={flight}
                credits={credits}
                positions={positions}
                onAddPosition={onAddPosition}
                onClosePosition={onClosePosition}
              />
              <HistoryPanel history={history} />
            </div>
          </div>
        )}
        <footer className="mt-10 border-t border-[#1f1f1f] pt-4 text-center text-xs text-[#666666]">
          Simulation only · No real trading
        </footer>
      </div>
    </div>
  )
}
