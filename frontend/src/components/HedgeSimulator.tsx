import { getMultipliers, getPayouts, type PayoutRow } from '../lib/hedge'

interface HedgeSimulatorProps {
  pDelay30: number | null
}

export function HedgeSimulator({ pDelay30 }: HedgeSimulatorProps) {
  if (pDelay30 == null || pDelay30 <= 0 || pDelay30 >= 1) {
    return (
      <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-terminal-muted">
          Hedge simulator
        </h2>
        <p className="mt-2 text-terminal-muted">Delay 30+ min? YES/NO — search a flight to see payouts.</p>
      </div>
    )
  }

  const { yesMult, noMult } = getMultipliers(pDelay30)
  const rows = getPayouts(pDelay30)

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
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-terminal-muted">
              <th className="pb-2 font-medium">Stake</th>
              <th className="pb-2 font-medium">Payout YES</th>
              <th className="pb-2 font-medium">Payout NO</th>
              <th className="pb-2 font-medium">EV YES</th>
              <th className="pb-2 font-medium">EV NO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: PayoutRow) => (
              <tr key={row.stake} className="border-b border-terminal-border/50">
                <td className="py-2 font-mono">${row.stake}</td>
                <td className="py-2 font-mono tabular-nums text-terminal-green">
                  ${row.payoutYes.toFixed(2)}
                </td>
                <td className="py-2 font-mono tabular-nums text-terminal-amber">
                  ${row.payoutNo.toFixed(2)}
                </td>
                <td className="py-2 font-mono tabular-nums">{row.evYes.toFixed(2)}</td>
                <td className="py-2 font-mono tabular-nums">{row.evNo.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
