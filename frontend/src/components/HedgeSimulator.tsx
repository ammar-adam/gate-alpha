import { useState, useEffect } from 'react'
import type { Market } from '../api/client'
import { getMultipliers } from '../lib/hedge'

const STAKES = [10, 50, 100] as const

interface HedgeSimulatorProps {
  pDelay30: number | null
  market: Market | null
  lastFetchedAt?: number | null
}

function TradeSimulator({
  pModel,
  market,
}: {
  pModel: number
  market: Market
}) {
  const [side, setSide] = useState<'YES' | 'NO'>('YES')
  const [stake, setStake] = useState(10)
  const [customStake, setCustomStake] = useState('')

  const priceCents = side === 'YES' ? market.yes_best_ask : market.no_best_ask
  const price = priceCents / 100
  const effectiveStake = customStake ? parseFloat(customStake) || 0 : stake
  const contracts = price > 0 ? effectiveStake / price : 0
  const maxPayout = contracts
  const profitIfWin = maxPayout - effectiveStake
  const ev =
    side === 'YES'
      ? pModel * profitIfWin + (1 - pModel) * -effectiveStake
      : (1 - pModel) * profitIfWin + pModel * -effectiveStake
  const marketP = side === 'YES' ? priceCents / 100 : 1 - priceCents / 100
  const edgePct = ((pModel - marketP) * 100).toFixed(1)

  return (
    <div className="mt-4 border-t border-terminal-border pt-4">
      <p className="text-xs font-medium uppercase text-terminal-muted">Trade simulator</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setSide('YES')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            side === 'YES'
              ? 'bg-terminal-green/30 text-terminal-green'
              : 'border border-terminal-border text-terminal-muted'
          }`}
        >
          BUY YES
        </button>
        <button
          type="button"
          onClick={() => setSide('NO')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            side === 'NO'
              ? 'bg-terminal-red/30 text-terminal-red'
              : 'border border-terminal-border text-terminal-muted'
          }`}
        >
          BUY NO
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-terminal-muted">Stake:</span>
        {STAKES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStake(s)
              setCustomStake('')
            }}
            className={`rounded px-2 py-1 text-sm font-mono ${
              stake === s && !customStake
                ? 'bg-terminal-amber text-terminal-bg'
                : 'border border-terminal-border'
            }`}
          >
            ${s}
          </button>
        ))}
        <input
          type="number"
          min={1}
          step={1}
          placeholder="Custom"
          value={customStake}
          onChange={(e) => setCustomStake(e.target.value)}
          className="w-20 rounded border border-terminal-border bg-terminal-bg px-2 py-1 text-sm font-mono"
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
        <span className="text-terminal-muted">Contracts</span>
        <span className="font-mono tabular-nums">{contracts.toFixed(0)}</span>
        <span className="text-terminal-muted">Avg fill</span>
        <span className="font-mono tabular-nums">{(priceCents / 100).toFixed(2)}</span>
        <span className="text-terminal-muted">Max payout</span>
        <span className="font-mono tabular-nums">${maxPayout.toFixed(2)}</span>
        <span className="text-terminal-muted">EV</span>
        <span className="font-mono tabular-nums">{ev.toFixed(2)}</span>
        <span className="text-terminal-muted">Edge vs model</span>
        <span className="font-mono tabular-nums">{edgePct}%</span>
      </div>
      <button
        type="button"
        disabled
        title="Hypothetical only — no real trading"
        className="mt-3 w-full rounded border border-terminal-border bg-terminal-border/30 py-2 text-sm text-terminal-muted disabled:cursor-not-allowed"
      >
        Place Bet — Hypothetical only (no real trading)
      </button>
    </div>
  )
}

export function HedgeSimulator({
  pDelay30,
  market,
  lastFetchedAt,
}: HedgeSimulatorProps) {
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    if (lastFetchedAt == null) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 1000)
    return () => clearTimeout(t)
  }, [lastFetchedAt])

  if (pDelay30 == null || pDelay30 <= 0 || pDelay30 >= 1) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Hedge simulator
        </h2>
        <p className="mt-2 text-terminal-muted">
          Delay 30+ min? YES/NO — search a flight to see market.
        </p>
      </div>
    )
  }

  if (!market) {
    const { yesMult, noMult } = getMultipliers(pDelay30)
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Hedge simulator
        </h2>
        <p className="mt-1 text-sm text-terminal-muted">Delay 30+ min? YES / NO</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-terminal-green">YES mult: {yesMult.toFixed(2)}×</span>
          <span className="text-terminal-amber">NO mult: {noMult.toFixed(2)}×</span>
        </div>
      </div>
    )
  }

  const maxYesSize = Math.max(
    ...market.yes_levels.map((l) => l.size),
    1
  )
  const maxNoSize = Math.max(...market.no_levels.map((l) => l.size), 1)

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Hedge simulator
      </h2>
      <p className="mt-0.5 text-sm text-terminal-muted">Delay 30+ min? YES / NO</p>

      <div className="mt-3 flex flex-wrap items-center gap-4 rounded border border-terminal-border bg-terminal-bg/50 px-3 py-2 text-sm">
        <span
          className={`rounded bg-terminal-green/20 px-2 py-0.5 font-mono font-semibold text-terminal-green ${
            pulse ? 'animate-pulse' : ''
          }`}
        >
          YES {market.yes_best_ask}¢
        </span>
        <span
          className={`rounded bg-terminal-red/20 px-2 py-0.5 font-mono font-semibold text-terminal-red ${
            pulse ? 'animate-pulse' : ''
          }`}
        >
          NO {market.no_best_ask}¢
        </span>
        <span className="text-terminal-muted">Vol 24h: {market.volume_24h}</span>
        <span className="text-terminal-muted">OI: {market.open_interest}</span>
        <span className="text-terminal-muted">Last: {market.last_trade_price}¢</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-terminal-green">YES — Bids</p>
          <div className="space-y-0.5">
            {market.yes_levels.map((level, i) => (
              <div
                key={`y-${i}`}
                className="relative flex items-center justify-between rounded px-2 py-0.5 text-sm"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded bg-terminal-green/10 transition-[width] duration-500"
                  style={{
                    width: `${(level.size / maxYesSize) * 100}%`,
                  }}
                />
                <span
                  className={`relative font-mono tabular-nums ${
                    level.price === market.yes_best_bid ? 'font-bold text-terminal-green' : ''
                  }`}
                >
                  {level.price}¢
                </span>
                <span className="relative font-mono tabular-nums text-terminal-muted">
                  {level.size}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-terminal-red">NO — Bids</p>
          <div className="space-y-0.5">
            {market.no_levels.map((level, i) => (
              <div
                key={`n-${i}`}
                className="relative flex items-center justify-between rounded px-2 py-0.5 text-sm"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded bg-terminal-red/10 transition-[width] duration-500"
                  style={{
                    width: `${(level.size / maxNoSize) * 100}%`,
                  }}
                />
                <span
                  className={`relative font-mono tabular-nums ${
                    level.price === market.no_best_bid ? 'font-bold text-terminal-red' : ''
                  }`}
                >
                  {level.price}¢
                </span>
                <span className="relative font-mono tabular-nums text-terminal-muted">
                  {level.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TradeSimulator pModel={pDelay30} market={market} />
    </div>
  )
}
