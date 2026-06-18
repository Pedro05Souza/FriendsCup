import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { championshipsApi } from '../api/championships'
import type { RecapData, RecapGoldenBoot, RecapDefense, RecapTitles, RecapRunnerUp } from '../types'
import { medal } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

function PodiumTable<T>({
  title,
  items,
  renderRow,
}: {
  title: string
  items: T[]
  renderRow: (item: T, index: number) => React.ReactNode
}) {
  return (
    <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-gh-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-8">No data</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {items.slice(0, 10).map((item, i) => renderRow(item, i))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-gh-border/40 last:border-0 hover:bg-gh-elevated/40 transition-colors">
      {children}
    </tr>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 ${className}`}>{children}</td>
}

export default function RecapPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [activeYear, setActiveYear] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['recap', activeYear],
    queryFn: () => championshipsApi.recap(activeYear),
    enabled: !!activeYear,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!year) return
    setActiveYear(year)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Year Recap</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Annual statistics and podiums</p>
      </div>

      <div className="bg-gh-surface border border-gh-border rounded-lg p-5 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              min={2000}
              max={2099}
              className="w-28 px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <Button variant="primary" type="submit" loading={isLoading}>
            Generate Recap
          </Button>
        </form>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          {(error as Error).message}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {data && (() => {
        const d = data as RecapData
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Golden Boot */}
            <PodiumTable
              title="⚽ Golden Boot"
              items={d.goldenBootPodium}
              renderRow={(p: RecapGoldenBoot, i) => (
                <Row key={p.playerId}>
                  <Td className="w-8">{medal(i)}</Td>
                  <Td className="font-medium">{p.playerName}</Td>
                  <Td><span className="font-bold text-emerald-400">{p.goals}</span> <span className="text-zinc-500">goals</span></Td>
                  <Td className="text-zinc-500 text-xs">{p.avgGoals}/match</Td>
                </Row>
              )}
            />

            {/* Best Defense */}
            <PodiumTable
              title="🛡️ Best Defense"
              items={d.defensePodium}
              renderRow={(p: RecapDefense, i) => (
                <Row key={p.playerId}>
                  <Td className="w-8">{medal(i)}</Td>
                  <Td className="font-medium">{p.playerName}</Td>
                  <Td><span className="font-bold text-blue-400">{p.goalsConceded}</span> <span className="text-zinc-500">conceded</span></Td>
                  <Td className="text-zinc-500 text-xs">{p.avgGoalsConceded}/match</Td>
                </Row>
              )}
            />

            {/* Most Titles */}
            <PodiumTable
              title="🏆 Most Titles"
              items={d.titlesPodium}
              renderRow={(p: RecapTitles, i) => (
                <Row key={p.playerId}>
                  <Td className="w-8">{medal(i)}</Td>
                  <Td className="font-medium">{p.playerName}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(p.titlesWon).map(([cup, n]) => (
                        <Badge key={cup} variant="green">{cup} ×{n}</Badge>
                      ))}
                    </div>
                  </Td>
                </Row>
              )}
            />

            {/* Runner Ups */}
            <PodiumTable
              title="🥈 Runner Ups"
              items={d.runnerUpPodium}
              renderRow={(p: RecapRunnerUp, i) => (
                <Row key={p.playerId}>
                  <Td className="w-8">{medal(i)}</Td>
                  <Td className="font-medium">{p.playerName}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(p.runnerUps).map(([cup, n]) => (
                        <Badge key={cup} variant="yellow">{cup} ×{n}</Badge>
                      ))}
                    </div>
                  </Td>
                </Row>
              )}
            />
          </div>
        )
      })()}
    </>
  )
}
