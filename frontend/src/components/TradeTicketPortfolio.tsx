import { useState } from 'react'
import type { Flight } from '../api/client'
import type { Position } from '../types/portfolio'
import { unrealizedPnl, MAX_POSITIONS_DISPLAY } from '../types/portfolio'

const STAKES = [10, 50, 100] as const

interface TradeTicketPortfolioProps {
  flight: Flight | null
  credits: number
  positions: Position[]
  onAddPosition: (flight_ident: string, side: 'YES' | 'NO', contracts: number, price_cents: number) => void
  onClosePosition: (id: string, refund: number) => void
}

export function TradeTicketPortfolio({
  flight,
  credits,
  positions,
  onAddPosition,
  onClosePosition,
}: TradeTicketPortfolioProps) {
  const [side, setSide] = useState<'YES' | 'NO'>('YES')
  const [contractsInput, setContractsInput] = useState('')

  const pMkt = flight?.prediction?.p_mkt ?? 0.5
  const pModel = flight?.prediction?.p_model_delay_30 ?? 0.5
  const priceCents = side === 'YES' ? Math.round(pMkt * 100) : Math.round((1 - pMkt) * 100)
  const contracts = Math.max(0, Math.floor(parseFloat(contractsInput) || 0))
  const cost = (contracts * priceCents) / 100
  const profitIfYes = side === 'YES' ? contracts * (1 - pMkt) : -contracts * pMkt
  const profitIfNo = side === 'NO' ? contracts * pMkt : -contracts * (1 - pMkt)
  const ev = side === 'YES' ? contracts * (pModel - pMkt) : contracts * (1 - pModel - (1 - pMkt))
  const insufficientCredits = cost > credits

  const handleBuy = () => {
    if (!flight || contracts <= 0 || insufficientCredits) return
    onAddPosition(flight.ident, side, contracts, priceCents)
    setContractsInput('')
  }

  const handleClose = (pos: Position) => {
    const refund = pos.side === 'YES' ? pos.contracts * (1 - pMkt) : pos.contracts * pMkt
    onClosePosition(pos.id, refund)
  }

  const displayPositions = positions.slice(0, MAX_POSITIONS_DISPLAY)
  const currentYesCents = Math.round(pMkt * 100)
  const totalPnl = positions.reduce((sum, p) => sum + unrealizedPnl(p, currentYesCents), 0)

  if (!flight) {
    return (
      <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-5">
        <h2 className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
          Trade & Portfolio
        </h2>
        <p className="mt-2 text-[#666666]">Search a flight to trade.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-5">
      <h2 className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
        Trade
      </h2>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setSide('YES')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            side === 'YES' ? 'bg-[#00d181]/30 text-[#00d181]' : 'border border-[#1f1f1f] text-[#999999]'
          }`}
        >
          Buy YES
        </button>
        <button
          type="button"
          onClick={() => setSide('NO')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            side === 'NO' ? 'bg-[#ff4444]/30 text-[#ff4444]' : 'border border-[#1f1f1f] text-[#999999]'
          }`}
        >
          Buy NO
        </button>
      </div>
      <div className="mt-2">
        <label className="text-xs text-[#666666]">Contracts</label>
        <div className="mt-0.5 flex flex-wrap gap-2">
          {STAKES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setContractsInput(String(s))}
              className="rounded border border-[#1f1f1f] px-2 py-1 text-sm font-mono text-[#ffffff] hover:bg-[#1f1f1f]"
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
            className="w-24 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-2 py-1 font-mono text-sm text-[#ffffff]"
          />
        </div>
      </div>
      {contracts > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
          <span className="text-[#666666]">Cost</span>
          <span className="font-mono tabular-nums text-[#ffffff]">{cost.toFixed(1)}</span>
          <span className="text-[#666666]">Profit if YES</span>
          <span className="font-mono tabular-nums text-[#00d181]">{profitIfYes.toFixed(1)}</span>
          <span className="text-[#666666]">Profit if NO</span>
          <span className="font-mono tabular-nums text-[#ff4444]">{profitIfNo.toFixed(1)}</span>
          <span className="text-[#666666]">Edge (EV)</span>
          <span className="font-mono tabular-nums text-[#f5a623]">{ev.toFixed(1)}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleBuy}
        disabled={contracts <= 0 || insufficientCredits}
        className="mt-3 w-full rounded bg-[#f5a623] py-2 font-semibold text-[#0a0a0a] disabled:opacity-50"
      >
        {insufficientCredits && contracts > 0 ? 'Insufficient credits' : 'Place bet'}
      </button>

      <div className="mt-4 border-t border-[#1f1f1f] pt-3">
        <p className="text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
          Portfolio · Total PnL: {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(1)}
        </p>
        {positions.length === 0 ? (
          <p className="mt-1 text-xs text-[#666666]">No open positions</p>
        ) : (
          <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto">
            {displayPositions.map((pos) => {
              const pnl = unrealizedPnl(pos, currentYesCents)
              return (
                <li
                  key={pos.id}
                  className="flex items-center justify-between rounded border border-[#1f1f1f] bg-[#0a0a0a] px-2 py-1.5 text-xs"
                >
                  <span className="font-mono text-[#ffffff]">
                    {pos.flight_ident} {pos.side} {pos.contracts} @ {pos.price_cents}¢
                  </span>
                  <span className={pnl >= 0 ? 'text-[#00d181]' : 'text-[#ff4444]'}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleClose(pos)}
                    className="rounded border border-[#1f1f1f] px-1.5 py-0.5 text-[#999999] hover:bg-[#1f1f1f]"
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
