import type { SearchResultItem } from '../api/client'

const EXAMPLE_FLIGHTS = [
  { ident: 'UA4469', route: 'EWR → BTV', date: '2026-02-25', status: 'DELAYED' },
  { ident: 'AC123', route: 'YYZ → YVR', date: '2026-02-25', status: 'ON_TIME' },
  { ident: 'DL404', route: 'JFK → LAX', date: '2026-02-25', status: 'CANCELLED' },
] as const

interface SearchBarProps {
  ident: string
  date: string
  mode: 'live' | 'demo'
  onIdentChange: (v: string) => void
  onDateChange: (v: string) => void
  onModeChange: (m: 'live' | 'demo') => void
  onSearch: (ident: string, date: string) => void
  loading?: boolean
  searchQuery?: string
  onSearchQueryChange?: (v: string) => void
  searchResults?: SearchResultItem[]
  onSelectSearchResult?: (ident: string) => void
}

export function SearchBar({
  ident,
  date,
  mode,
  onIdentChange,
  onDateChange,
  onModeChange,
  onSearch,
  loading = false,
  searchQuery = '',
  onSearchQueryChange,
  searchResults = [],
  onSelectSearchResult,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(ident, date)
  }

  const handleChip = (chipIdent: string, chipDate: string) => {
    onIdentChange(chipIdent)
    onDateChange(chipDate)
    onSearch(chipIdent, chipDate)
  }

  const showDropdown = Boolean(
    onSearchQueryChange && searchResults.length > 0 && searchQuery.trim()
  )

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-xs text-terminal-muted">Data:</span>
        <button
          type="button"
          onClick={() => onModeChange('demo')}
          className={`rounded px-2.5 py-1 text-xs font-medium ${
            mode === 'demo'
              ? 'bg-terminal-amber text-terminal-bg'
              : 'border border-terminal-border text-terminal-muted'
          }`}
        >
          DEMO
        </button>
        <button
          type="button"
          onClick={() => onModeChange('live')}
          className={`rounded px-2.5 py-1 text-xs font-medium ${
            mode === 'live'
              ? 'bg-terminal-green text-terminal-bg'
              : 'border border-terminal-border text-terminal-muted'
          }`}
        >
          LIVE
        </button>
      </div>
      {onSearchQueryChange && (
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by flight, route, airline…"
            className="w-full max-w-md rounded border border-terminal-border bg-terminal-surface px-3 py-2 text-white placeholder:text-terminal-muted focus:border-terminal-amber focus:outline-none"
          />
          {showDropdown && (
            <ul className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full max-w-md overflow-auto rounded border border-terminal-border bg-terminal-surface py-1">
              {searchResults.map((r) => (
                <li key={`${r.ident}-${r.route}`}>
                  <button
                    type="button"
                    onClick={() => onSelectSearchResult?.(r.ident)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-terminal-border"
                  >
                    <span className="font-mono font-semibold">{r.ident}</span>
                    <span className="mx-2 text-terminal-muted">{r.route}</span>
                    <span className="text-terminal-muted">{r.status}</span>
                    <span className="ml-2 text-terminal-muted">{r.departure_time}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-terminal-muted">Flight number</span>
          <input
            type="text"
            value={ident}
            onChange={(e) => onIdentChange(e.target.value)}
            placeholder="e.g. UA4469"
            className="w-40 rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-white placeholder:text-terminal-muted focus:border-terminal-amber focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-terminal-muted">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-44 rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-white focus:border-terminal-amber focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-terminal-amber px-4 py-2 font-semibold text-terminal-bg disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-terminal-muted">Example flights:</span>
        {EXAMPLE_FLIGHTS.map((ex) => (
          <button
            key={ex.ident}
            type="button"
            onClick={() => handleChip(ex.ident, ex.date)}
            className="rounded border border-terminal-border bg-terminal-surface px-3 py-1.5 text-left text-sm font-mono text-gray-200 hover:border-terminal-amber hover:text-terminal-amber"
          >
            <span className="font-semibold">{ex.ident}</span>
            <span className="mx-1.5 text-terminal-muted">|</span>
            <span>{ex.route}</span>
            <span className="mx-1.5 text-terminal-muted">|</span>
            <span>{ex.date}</span>
            <span className="mx-1.5 text-terminal-muted">|</span>
            <span
              className={
                ex.status === 'DELAYED'
                  ? 'text-terminal-amber'
                  : ex.status === 'CANCELLED'
                    ? 'text-terminal-red'
                    : 'text-terminal-green'
              }
            >
              {ex.status}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
