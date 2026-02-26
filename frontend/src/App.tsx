import { useFlightSearch } from './hooks/useFlightSearch'
import { Layout } from './components/Layout'

function App() {
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

  return (
    <Layout
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
    />
  )
}

export default App
