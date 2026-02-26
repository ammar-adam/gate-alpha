export interface Position {
  id: string
  flight_ident: string
  side: 'YES' | 'NO'
  contracts: number
  price_cents: number
  cost: number
}

export const INITIAL_CREDITS = 1000
export const MAX_POSITIONS_DISPLAY = 10

export function unrealizedPnl(
  position: Position,
  currentYesCents: number
): number {
  const currentYes = currentYesCents / 100
  const currentNo = 1 - currentYes
  if (position.side === 'YES') {
    return position.contracts * (currentYes - position.price_cents / 100)
  }
  return position.contracts * (currentNo - position.price_cents / 100)
}
