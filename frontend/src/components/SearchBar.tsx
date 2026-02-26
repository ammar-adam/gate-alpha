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
