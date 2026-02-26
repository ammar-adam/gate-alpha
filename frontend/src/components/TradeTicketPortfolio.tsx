import { useState, useEffect, useCallback } from 'react'
import type { Flight } from '../api/client'
import {
  getCredits,
  setCredits,
  getPositions,
  addPosition,
  removePosition,
  unrealizedPnl,
  type Position,
} from '../lib/portfolio'

const STAKES = [10, 50, 100] as const

interface TradeTicketPortfolioProps {
  flight: Flight | null
  pMkt: number
}

export function TradeTicketPortfolio({ flight, pMkt }: TradeTicketPortfolioProps) {
  const [credits, setCreditsState] = useState(getCredits)
  const [positions, setPositionsState] = useState<Position[]>(getPositions)
  const [side, setSide] = useState<'YES' | 'NO'>('YES')
  const [contractsInput, setContractsInput] = useState('')

  const refresh = useCallback(() => {
    setCreditsState(getCredits())
    setPositionsState(getPositions())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const pModel = flight?.prediction?.p_model_delay_30 ?? 0.5
  const contracts = Math.max(0, Math.floor(parseFloat(contractsInput) || 0))
  const price = side === 'YES' ? pMkt : 1 - pMkt
  const cost = contracts * price
  const profitIfYes = side === 'YES' ? contracts * (1 - pMkt) : -contracts * pMkt
  const profitIfNo = side === 'NO' ? contracts * pMkt : -contracts * (1 - pMkt)
  const ev = side === 'YES' ? contracts * (pModel - pMkt) : contracts * (1 - pModel - (1 - pMkt))

  const handleBuy = () => {
    if (contracts <= 0 || cost > credits) return
    const newCredits = credits - cost
    setCredits(newCredits)
    addPosition(side, contracts, price)
    setCreditsState(newCredits)
    setPositionsState(getPositions())
  }

  const handleClose = (id: string) => {
    const pos = removePosition(id)
    if (!pos) return
    const currentPrice = pos.side === 'YES' ? pMkt : 1 - pMkt
    const proceeds = pos.contracts * currentPrice
    const newCredits = getCredits() + proceeds
    setCredits(newCredits)
    setCreditsState(newCredits)
    setPositionsState(getPositions())
  }

  if (!flight) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Trade & Portfolio
        </h2>
        <p className="mt-2 text-terminal-muted">Search a flight to trade.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
        Trade & Portfolio
      </h2>

      <div className="mt-3 rounded border border-terminal-border bg-terminal-bg/50 p-3">
        <p className="text-xs text-terminal-muted">Credits</p>
        <p className="font-mono text-2xl font-bold tabular-nums text-terminal-green">{credits.toFixed(0)}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setSide('YES')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            side === 'YES' ? 'bg-terminal-green/30 text-terminal-green' : 'border border-terminal-border'
          }`}
        >
          Buy YES
        </button>
        <button
          type="button"
          onClick={() => setSide('NO')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            side === 'NO' ? 'bg-terminal-red/30 text-terminal-red' : 'border border-terminal-border'
          }`}
        >
          Buy NO
        </button>
      </div>
      <div className="mt-2">
        <label className="text-xs text-terminal-muted">Contracts</label>
        <div className="mt-0.5 flex gap-2">
          {STAKES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setContractsInput(String(s))}
              className="rounded border border-terminal-border px-2 py-1 text-sm font-mono"
            >
              {s}
            </button>
          ))}
          <input
            type="number"
            min={0}
            step={1}
            value={contractsInput}
            onChange={(e) => setContractsInput(e.target.value)}
            className="w-24 rounded border border-terminal-border bg-terminal-bg px-2 py-1 font-mono text-sm"
          />
        </div>
      </div>
      {contracts > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
          <span className="text-terminal-muted">Cost (credits)</span>
          <span className="font-mono tabular-nums">{cost.toFixed(1)}</span>
          <span className="text-terminal-muted">Profit if YES</span>
          <span className="font-mono tabular-nums text-terminal-green">{profitIfYes.toFixed(1)}</span>
          <span className="text-terminal-muted">Profit if NO</span>
          <span className="font-mono tabular-nums text-terminal-red">{profitIfNo.toFixed(1)}</span>
          <span className="text-terminal-muted">EV (credits)</span>
          <span className="font-mono tabular-nums">{ev.toFixed(1)}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleBuy}
        disabled={contracts <= 0 || cost > credits}
        className="mt-3 w-full rounded bg-terminal-amber py-2 font-semibold text-terminal-bg disabled:opacity-50"
      >
        Place bet
      </button>

      <div className="mt-4 border-t border-terminal-border pt-3">
        <p className="text-xs font-medium text-terminal-muted">Open positions</p>
        {positions.length === 0 ? (
          <p className="mt-1 text-xs text-terminal-muted">None</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {positions.map((pos) => {
              const pnl = unrealizedPnl(pos, pMkt)
              return (
                <li
                  key={pos.id}
                  className="flex items-center justify-between rounded border border-terminal-border bg-terminal-bg px-2 py-1 text-xs"
                >
                  <span className="font-mono">
                    {pos.side} {pos.contracts} @ {(pos.entryPrice * 100).toFixed(0)}¢
                  </span>
                  <span className={pnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleClose(pos.id)}
                    className="rounded border border-terminal-border px-1.5 py-0.5 hover:bg-terminal-border"
                  >
                    Close
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
