import { useState } from 'react'

interface AuthModalProps {
  onSubmit: (name: string) => void
}

export function AuthModal({ onSubmit }: AuthModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm rounded-lg border border-[#1f1f1f] bg-[#111111] p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Welcome to GateAlpha</h2>
        <p className="mt-1 text-sm text-[#666666]">Enter your name to start trading (simulation only).</p>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-white placeholder:text-[#666666] focus:border-[#f5a623] focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-3 w-full rounded bg-[#f5a623] py-2 font-semibold text-[#0a0a0a] disabled:opacity-50"
          >
            Start trading
          </button>
        </form>
      </div>
    </div>
  )
}
