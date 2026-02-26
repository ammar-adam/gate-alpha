interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded border border-terminal-red/50 bg-terminal-red/10 px-4 py-2 text-sm text-terminal-red"
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded px-2 py-0.5 hover:bg-terminal-red/20"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
