import { useFlightSearch } from './hooks/useFlightSearch'
import { Layout } from './components/Layout'

function App() {
  const {
    ident,
    date,
    flight,
    history,
    market,
    dataSource,
    loading,
    error,
    demoMode,
    lastFetchedAt,
    probabilityFlash,
    search,
    setIdent,
    setDate,
    clearError,
  } = useFlightSearch()

  return (
    <Layout
      ident={ident}
      date={date}
      onIdentChange={setIdent}
      onDateChange={setDate}
      onSearch={search}
      flight={flight}
      history={history}
      market={market}
      dataSource={dataSource}
      loading={loading}
      error={error}
      onDismissError={clearError}
      demoMode={demoMode}
      lastFetchedAt={lastFetchedAt}
      probabilityFlash={probabilityFlash}
    />
  )
}

export default App
