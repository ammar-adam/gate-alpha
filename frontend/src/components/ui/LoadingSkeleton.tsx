export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-24 rounded bg-terminal-border" />
      <div className="h-8 w-32 rounded bg-terminal-border" />
      <div className="h-3 w-full rounded bg-terminal-border" />
      <div className="h-3 w-4/5 rounded bg-terminal-border" />
      <div className="h-3 w-3/5 rounded bg-terminal-border" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <LoadingSkeleton />
    </div>
  )
}
