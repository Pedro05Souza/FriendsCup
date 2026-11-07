import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { championshipsApi } from '../api/championships'
import type { RecapData, RecapGoldenBoot, RecapDefense, RecapTitles, RecapRunnerUp } from '../types'
import { fmtCup } from '../lib/utils'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import RankNumber from '../components/ui/RankNumber'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

function Podium<T>({
  title,
  description,
  items,
  renderRow,
}: {
  title: string
  description: string
  items: T[]
  renderRow: (item: T, index: number) => React.ReactNode
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-turf-line">
        <h2 className="panel-title">{title}</h2>
        <p className="text-sm text-chalk-faint mt-1.5">{description}</p>
      </div>
      {items.length === 0 ? (
        <Empty title="Nobody yet" className="py-8" />
      ) : (
        <ol className="divide-y divide-turf-line/60">
          {items.slice(0, 10).map((item, i) => (
            <li key={i} className="grid grid-cols-[2.5rem,1fr,auto] items-center gap-3 px-6 py-3">
              <RankNumber rank={i + 1} className="text-2xl" />
              {renderRow(item, i)}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function Metric({ value, unit, sub }: { value: React.ReactNode; unit: string; sub?: string }) {
  return (
    <div className="text-right">
      <span className="font-display text-3xl font-extrabold leading-none tabular-nums text-chalk">{value}</span>
      <span className="ml-1.5 text-sm text-chalk-muted">{unit}</span>
      {sub && <p className="text-xs text-chalk-faint tabular-nums mt-0.5">{sub}</p>}
    </div>
  )
}

function CupList({ cups }: { cups: Record<string, number> }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {Object.entries(cups).map(([cup, n]) => (
        <span
          key={cup}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-chalk-muted bg-turf-raised border border-turf-line rounded-md px-2 py-1"
        >
          {fmtCup(cup)}
          <span className="font-bold text-gold tabular-nums">×{n}</span>
        </span>
      ))}
    </div>
  )
}

export default function RecapPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [activeYear, setActiveYear] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['recap', activeYear],
    queryFn: () => championshipsApi.recap(activeYear),
    enabled: !!activeYear,
  })

  const show = (y: string) => {
    if (!y) return
    setYear(y)
    setActiveYear(y)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    show(year)
  }

  return (
    <>
      <PageHeader
        title={activeYear ? `${activeYear} in review` : 'Year recap'}
        description="Who scored, who defended and who lifted cups in a single season."
        actions={
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-turf-line bg-turf-surface">
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => show(String(Number(year) - 1))}
                className="p-2.5 text-chalk-muted hover:text-chalk"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <label htmlFor="recap-year" className="sr-only">Year</label>
              <input
                id="recap-year"
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                min={2000}
                max={2099}
                className="w-20 bg-transparent text-center font-display text-2xl font-extrabold text-chalk tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="Next year"
                onClick={() => show(String(Number(year) + 1))}
                className="p-2.5 text-chalk-muted hover:text-chalk"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Button variant="primary" type="submit" loading={isLoading}>
              Show recap
            </Button>
          </form>
        }
      />

      {!activeYear && (
        <div className="panel">
          <Empty title="Pick a season" hint="Choose a year and select “Show recap” to see that season’s podiums." />
        </div>
      )}

      {error && <ErrorNote error={error} className="mb-4" />}
      {isLoading && <Loading />}

      {data && (() => {
        const d = data as RecapData
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Podium
              title="Golden boot"
              description="Most goals scored"
              items={d.goldenBootPodium}
              renderRow={(p: RecapGoldenBoot) => (
                <>
                  <span className="font-semibold truncate">{p.playerName}</span>
                  <Metric value={p.goals} unit="goals" sub={`${p.avgGoals} per match`} />
                </>
              )}
            />

            <Podium
              title="Best defense"
              description="Fewest goals conceded"
              items={d.defensePodium}
              renderRow={(p: RecapDefense) => (
                <>
                  <span className="font-semibold truncate">{p.playerName}</span>
                  <Metric value={p.goalsConceded} unit="conceded" sub={`${p.avgGoalsConceded} per match`} />
                </>
              )}
            />

            <Podium
              title="Most titles"
              description="Cups won this season"
              items={d.titlesPodium}
              renderRow={(p: RecapTitles) => (
                <>
                  <span className="font-semibold truncate">{p.playerName}</span>
                  <CupList cups={p.titlesWon} />
                </>
              )}
            />

            <Podium
              title="Runners-up"
              description="Lost in a final"
              items={d.runnerUpPodium}
              renderRow={(p: RecapRunnerUp) => (
                <>
                  <span className="font-semibold truncate">{p.playerName}</span>
                  <CupList cups={p.runnerUps} />
                </>
              )}
            />
          </div>
        )
      })()}
    </>
  )
}
