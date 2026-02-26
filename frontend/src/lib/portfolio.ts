const CREDITS_KEY = 'gatealpha_credits'
const POSITIONS_KEY = 'gatealpha_positions'
const INITIAL_CREDITS = 1000

export interface Position {
  id: string
  side: 'YES' | 'NO'
  contracts: number
  entryPrice: number
  timestamp: number
}

export function getCredits(): number {
  try {
    const s = localStorage.getItem(CREDITS_KEY)
    if (s == null) return INITIAL_CREDITS
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : INITIAL_CREDITS
  } catch {
    return INITIAL_CREDITS
  }
}

export function setCredits(value: number): void {
  localStorage.setItem(CREDITS_KEY, String(Math.max(0, value)))
}

export function getPositions(): Position[] {
  try {
    const s = localStorage.getItem(POSITIONS_KEY)
    if (!s) return []
    const arr = JSON.parse(s) as unknown[]
    return Array.isArray(arr)
      ? arr.filter(
          (p): p is Position =>
            p != null &&
            typeof p === 'object' &&
            typeof (p as Position).id === 'string' &&
            ((p as Position).side === 'YES' || (p as Position).side === 'NO') &&
            typeof (p as Position).contracts === 'number' &&
            typeof (p as Position).entryPrice === 'number' &&
            typeof (p as Position).timestamp === 'number'
        )
      : []
  } catch {
    return []
  }
}

export function setPositions(positions: Position[]): void {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions))
}

export function addPosition(side: 'YES' | 'NO', contracts: number, entryPrice: number): Position {
  const positions = getPositions()
  const id = `pos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const pos: Position = { id, side, contracts, entryPrice, timestamp: Date.now() }
  positions.push(pos)
  setPositions(positions)
  return pos
}

export function removePosition(id: string): Position | null {
  const positions = getPositions()
  const idx = positions.findIndex((p) => p.id === id)
  if (idx === -1) return null
  const [removed] = positions.splice(idx, 1)
  setPositions(positions)
  return removed
}

export function unrealizedPnl(position: Position, pMkt: number): number {
  if (position.side === 'YES') {
    return position.contracts * (pMkt - position.entryPrice)
  }
  return position.contracts * (1 - pMkt - (1 - position.entryPrice))
}
