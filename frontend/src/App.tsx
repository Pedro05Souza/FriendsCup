import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Layout from './components/layout/Layout'
import PlayersPage from './pages/PlayersPage'
import ChampionshipsPage from './pages/ChampionshipsPage'
import WinnersPage from './pages/WinnersPage'
import RecapPage from './pages/RecapPage'
import H2HPage from './pages/H2HPage'
import RankingsPage from './pages/RankingsPage'
import RecordsPage from './pages/RecordsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/players" replace />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/championships" element={<ChampionshipsPage />} />
            <Route path="/winners" element={<WinnersPage />} />
            <Route path="/recap" element={<RecapPage />} />
            <Route path="/h2h" element={<H2HPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/records" element={<RecordsPage />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  )
}
