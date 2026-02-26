import { useState, useCallback } from 'react'
import { useFlightSearch } from './hooks/useFlightSearch'
import { Layout } from './components/Layout'
import { AuthModal } from './components/AuthModal'
import type { Position } from './types/portfolio'
import { INITIAL_CREDITS } from './types/portfolio'

function App() {
  const [userName, setUserName] = useState('')
  const {
    ident,
    date,
    flight,
    history,
    dataSource,
    mode,
    loading,
    error,
    search,
    setIdent,
    setDate,
    setMode,
    clearError,
  } = useFlightSearch()

  const [credits, setCredits] = useState(INITIAL_CREDITS)
  const [positions, setPositions] = useState<Position[]>([])

  const addPosition = useCallback(
    (flight_ident: string, side: 'YES' | 'NO', contracts: number, price_cents: number) => {
      const cost = (contracts * price_cents) / 100
      if (cost > credits) return
      setCredits((c) => c - cost)
      const id = `pos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      setPositions((prev) =>
        prev.concat([
          {
            id,
            flight_ident,
            side,
            contracts,
            price_cents,
            cost,
          },
        ])
      )
    },
    [credits]
  )

  const closePosition = useCallback((id: string, refund: number) => {
    setCredits((c) => c + refund)
    setPositions((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <>
      {!userName && <AuthModal onSubmit={setUserName} />}
      <Layout
        userName={userName}
        ident={ident}
      date={date}
      mode={mode}
      onIdentChange={setIdent}
      onDateChange={setDate}
      onModeChange={setMode}
      onSearch={search}
      flight={flight}
      history={history}
      dataSource={dataSource}
      loading={loading}
      error={error}
      onDismissError={clearError}
      credits={credits}
      positions={positions}
      onAddPosition={addPosition}
      onClosePosition={closePosition}
      />
    </>
  )
}

export default App
