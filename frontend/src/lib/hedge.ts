/**
 * Hedge simulator math per TECH_SPEC 2.7:
 * yes_mult = 1 / P, no_mult = 1 / (1 - P)
 * profit_yes_if_true = stake * (yes_mult - 1)
 * EV_yes = P * profit_yes_if_true + (1 - P) * (-stake)
 */

const STAKES = [10, 50, 100] as const

function clampP(p: number): number {
  if (p <= 0 || p >= 1) return 0.5
  return p
}

export function getMultipliers(p: number): { yesMult: number; noMult: number } {
  const P = clampP(p)
  return {
    yesMult: 1 / P,
    noMult: 1 / (1 - P),
  }
}

export interface PayoutRow {
  stake: number
  payoutYes: number
  payoutNo: number
  evYes: number
  evNo: number
}

export function getPayouts(p: number, stakes: number[] = [...STAKES]): PayoutRow[] {
  const P = clampP(p)
  const { yesMult, noMult } = getMultipliers(P)
  return stakes.map((stake) => {
    const profitYesIfTrue = stake * (yesMult - 1)
    const profitNoIfTrue = stake * (noMult - 1)
    const evYes = P * profitYesIfTrue + (1 - P) * -stake
    const evNo = (1 - P) * profitNoIfTrue + P * -stake
    return {
      stake,
      payoutYes: Math.round(profitYesIfTrue * 100) / 100,
      payoutNo: Math.round(profitNoIfTrue * 100) / 100,
      evYes: Math.round(evYes * 100) / 100,
      evNo: Math.round(evNo * 100) / 100,
    }
  })
}

export { STAKES }
