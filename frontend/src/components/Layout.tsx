import { SearchBar } from './SearchBar'
import { StatusCard } from './StatusCard'
import { ProbabilityCard } from './ProbabilityCard'
import { HedgeSimulator } from './HedgeSimulator'
import { HistoryPanel } from './HistoryPanel'
import { CardSkeleton } from './ui/LoadingSkeleton'
import { ErrorBanner } from './ui/ErrorBanner'
import type { Flight, History, Market, DataSource } from '../api/client'

interface LayoutProps {
  ident: string
  date: string
  onIdentChange: (v: string) => void
  onDateChange: (v: string) => void
  onSearch: (ident: string, date: string) => void
  flight: Flight | null
  history: History | null
  market: Market | null
  dataSource: DataSource
  loading: boolean
  error: string | null
  onDismissError: () => void
  demoMode: boolean
  lastFetchedAt: number | null
  probabilityFlash: boolean
}

export function Layout({
  ident,
  date,
  onIdentChange,
  onDateChange,
  onSearch,
  flight,
  history,
  market,
  dataSource,
  loading,
  error,
  onDismissError,
  demoMode,
  lastFetchedAt,
  probabilityFlash,
}: LayoutProps) {
  return (
    <div className="relative min-h-screen">
      {demoMode && (
        <div className="absolute right-4 top-4 rounded border border-terminal-amber bg-terminal-amber/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-terminal-amber">
          DEMO
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">GateAlpha</h1>
          <p className="mt-0.5 text-sm text-terminal-muted">
            Flight delay risk · Hypothetical hedge simulator
          </p>
        </header>
        <div className="mb-6">
          <SearchBar
            ident={ident}
            date={date}
            onIdentChange={onIdentChange}
            onDateChange={onDateChange}
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
            <StatusCard flight={flight} lastFetchedAt={lastFetchedAt} />
            <ProbabilityCard
              prediction={flight?.prediction ?? null}
              dataSource={dataSource}
              flash={probabilityFlash}
            />
            <HedgeSimulator
              pDelay30={flight?.prediction?.p_delay_30 ?? null}
              market={market}
              lastFetchedAt={lastFetchedAt}
            />
            <HistoryPanel history={history} />
          </div>
        )}
        <footer className="mt-10 border-t border-terminal-border pt-4 text-center text-xs text-terminal-muted">
          Hypothetical simulation. Not financial advice. No real trading.
        </footer>
      </div>
    </div>
  )
}
