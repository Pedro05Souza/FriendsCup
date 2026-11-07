import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PlayersPage from './pages/PlayersPage'
import PlayerPage from './pages/PlayerPage'
import ChampionshipsPage from './pages/ChampionshipsPage'
import WinnersPage from './pages/WinnersPage'
import RecapPage from './pages/RecapPage'
import H2HPage from './pages/H2HPage'
import RankingsPage from './pages/RankingsPage'
import RecordsPage from './pages/RecordsPage'
import SimulatorPage from './pages/SimulatorPage'

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
            <Route index element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerPage />} />
            <Route path="/championships/:id?" element={<ChampionshipsPage />} />
            <Route path="/winners" element={<WinnersPage />} />
            <Route path="/recap" element={<RecapPage />} />
            <Route path="/h2h" element={<H2HPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#183428',
            border: '1px solid #264638',
            color: '#EEF3EF',
            fontFamily: 'Figtree, system-ui, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
  )
}
