import { useState, useEffect } from 'react'

interface LastUpdatedProps {
  lastFetchedAt: number | null
  className?: string
}

export function LastUpdated({ lastFetchedAt, className = '' }: LastUpdatedProps) {
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null)

  useEffect(() => {
    if (lastFetchedAt == null) {
      setSecondsAgo(null)
      return
    }
    const tick = () => {
      setSecondsAgo(Math.floor((Date.now() - lastFetchedAt) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lastFetchedAt])

  if (lastFetchedAt == null || secondsAgo == null) return null

  const text =
    secondsAgo < 5
      ? 'Just updated'
      : secondsAgo < 60
        ? `Last updated ${secondsAgo}s ago`
        : `Last updated ${Math.floor(secondsAgo / 60)}m ago`

  return (
    <span className={`text-xs text-terminal-muted ${className}`} role="timer">
      {text}
    </span>
  )
}
