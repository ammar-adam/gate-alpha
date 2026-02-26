import { useFlightSearch } from './hooks/useFlightSearch'
import { Layout } from './components/Layout'

function App() {
  const {
    ident,
    date,
    flight,
    history,
    loading,
    error,
    demoMode,
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
      loading={loading}
      error={error}
      onDismissError={clearError}
      demoMode={demoMode}
    />
  )
}

export default App
