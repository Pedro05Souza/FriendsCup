import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dices, Trophy } from 'lucide-react'
import { championshipsApi } from '../api/championships'
import { matchesApi } from '../api/matches'
import { playersApi } from '../api/players'
import type { CupFormat, CupSimulation, Player } from '../types'
import { cn, pct } from '../lib/utils'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import PlayerLink from '../components/ui/PlayerLink'
import RankNumber from '../components/ui/RankNumber'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

const SIMULATIONS = 10000
const THIN_RECORD = 6

const FORMATS: { value: CupFormat; label: string; hint: string }[] = [
  { value: 'KNOCKOUT', label: 'Knockout', hint: 'A random bracket; draws go to penalties.' },
  { value: 'GROUPS_AND_KNOCKOUT', label: 'Groups, then knockout', hint: 'Groups of about four, top two go through.' },
]

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-1.5 rounded-full bg-turf-line/70 overflow-hidden" aria-hidden="true">
      <div className={cn('h-full rounded-full', tone)} style={{ width: `${Math.max(value * 100, value > 0 ? 1 : 0)}%` }} />
    </div>
  )
}

function Results({ result }: { result: CupSimulation }) {
  const fav = result.odds[0]!
  const groups = result.format === 'GROUPS_AND_KNOCKOUT'

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden panel border-gold/30 px-6 sm:px-8 py-7 bg-[linear-gradient(120deg,rgba(242,193,78,0.10),transparent_55%)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-gold">
          <Trophy className="w-4 h-4" /> Favourite
        </p>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 mt-3">
          <p className="font-display text-6xl sm:text-7xl font-black leading-[0.85] text-chalk">
            <PlayerLink id={fav.playerId} name={fav.playerName} className="hover:no-underline" />
          </p>
          <p className="font-display text-6xl sm:text-7xl font-black leading-[0.85] tabular-nums text-gold">
            {pct(fav.title)}
          </p>
        </div>
        <p className="mt-3 text-sm text-chalk-muted">
          Won {Math.round(fav.title * result.simulations).toLocaleString('en-US')} of{' '}
          {result.simulations.toLocaleString('en-US')} simulated cups.
        </p>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-turf-line text-chalk-faint">
                <th className="pl-5 sm:pl-6 pr-2 py-3 text-left text-xs font-semibold w-12" />
                <th className="px-3 py-3 text-left text-xs font-semibold">Player</th>
                <th className="px-3 py-3 text-left text-xs font-semibold w-[28%]">Wins the cup</th>
                <th className="px-3 py-3 text-right text-xs font-semibold">Final</th>
                <th className="px-3 py-3 text-right text-xs font-semibold">Semis</th>
                {groups && <th className="pl-3 pr-5 sm:pr-6 py-3 text-right text-xs font-semibold">Out of the group</th>}
              </tr>
            </thead>
            <tbody>
              {result.odds.map((o, i) => (
                <tr key={o.playerId} className="border-b border-turf-line/60 last:border-0">
                  <td className="pl-5 sm:pl-6 pr-2 py-3"><RankNumber rank={i + 1} className="text-2xl" /></td>
                  <td className="px-3 py-3">
                    <PlayerLink id={o.playerId} name={o.playerName} className="font-semibold text-[15px] text-chalk whitespace-nowrap" />
                    {o.matchesInModel < THIN_RECORD && (
                      <p className="text-[11px] text-chalk-faint">
                        {o.matchesInModel === 0 ? 'No 1v1 matches yet' : `Only ${o.matchesInModel} 1v1 ${o.matchesInModel === 1 ? 'match' : 'matches'}`}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl font-extrabold tabular-nums text-chalk w-14">{pct(o.title)}</span>
                      <div className="flex-1 min-w-[60px]"><Bar value={o.title} tone="bg-gold" /></div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-chalk-muted">{pct(o.final)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-chalk-muted">{pct(o.semifinal)}</td>
                  {groups && <td className="pl-3 pr-5 sm:pr-6 py-3 text-right tabular-nums text-chalk-muted">{pct(o.knockout)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function PowerRatingsPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ['power-ratings'], queryFn: matchesApi.powerRatings })
  if (isLoading) return <Loading className="py-8" />
  if (error) return <ErrorNote error={error} />
  if (!data) return null

  const rated = data.ratings.filter(r => r.matchesInModel > 0)
  const maxGoals = Math.max(...rated.flatMap(r => [r.attack, r.defence]), 1)

  return (
    <section className="panel overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <h2 className="panel-title">How the model rates everyone</h2>
        <p className="text-sm text-chalk-faint mt-1.5 max-w-2xl">
          Goals each player would score and concede against an average opponent, from {data.matchesUsed} 1v1 matches.
          Older matches count less: their weight halves every {data.halfLifeYears} years.
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-turf-line text-chalk-faint">
              <th className="pl-5 sm:pl-6 pr-3 py-2.5 text-left text-xs font-semibold">Player</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Scores</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Concedes</th>
              <th className="pl-3 pr-5 sm:pr-6 py-2.5 text-right text-xs font-semibold">Goal difference</th>
            </tr>
          </thead>
          <tbody>
            {rated.map(r => (
              <tr key={r.playerId} className="border-b border-turf-line/60 last:border-0">
                <td className="pl-5 sm:pl-6 pr-3 py-2.5">
                  <PlayerLink id={r.playerId} name={r.playerName} className="font-semibold text-chalk whitespace-nowrap" />
                  <span className="ml-2 text-[11px] text-chalk-faint tabular-nums">{r.matchesInModel} m</span>
                </td>
                <td className="px-3 py-2.5 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums w-8 text-chalk">{r.attack.toFixed(1)}</span>
                    <div className="flex-1"><Bar value={r.attack / maxGoals} tone="bg-win" /></div>
                  </div>
                </td>
                <td className="px-3 py-2.5 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums w-8 text-chalk">{r.defence.toFixed(1)}</span>
                    <div className="flex-1"><Bar value={r.defence / maxGoals} tone="bg-loss" /></div>
                  </div>
                </td>
                <td className="pl-3 pr-5 sm:pr-6 py-2.5 text-right">
                  <span className={cn('font-display text-xl font-extrabold tabular-nums', r.strength > 0.05 ? 'text-win' : r.strength < -0.05 ? 'text-loss' : 'text-chalk')}>
                    {Math.abs(r.strength) < 0.005 ? '0.00' : `${r.strength > 0 ? '+' : ''}${r.strength.toFixed(2)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function SimulatorPage() {
  const { data: players = [], isLoading } = useQuery({ queryKey: ['players-all'], queryFn: playersApi.all })
  const { data: briefs } = useQuery({ queryKey: ['championships'], queryFn: championshipsApi.list })
  const latestSolo = useMemo(
    () => [...(briefs ?? [])].filter(c => !c.isDuo).sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))[0],
    [briefs],
  )
  const { data: latestCup } = useQuery({
    queryKey: ['championship', latestSolo?.id],
    queryFn: () => championshipsApi.get(latestSolo!.id),
    enabled: !!latestSolo,
  })

  const [selected, setSelected] = useState<Set<string> | null>(null)
  const [format, setFormat] = useState<CupFormat>('KNOCKOUT')

  // Start from the line-up of the latest 1v1 cup
  useEffect(() => {
    if (selected === null && latestCup) setSelected(new Set(latestCup.players.map(p => p.id)))
  }, [latestCup, selected])

  const chosen = selected ?? new Set<string>()
  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev ?? [])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const run = useMutation({
    mutationFn: () => championshipsApi.simulate({ playerIds: [...chosen], format, simulations: SIMULATIONS }),
    onError: (e: Error) => toast.error(e.message),
  })

  const sorted = [...(players as Player[])].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <PageHeader
        title="Cup simulator"
        description="Pick who's playing and the format. The whole cup is played 10,000 times with the match model, and you get everyone's chances."
      />

      <section className="panel p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
          <h2 className="font-display text-xl font-bold text-chalk">
            Players <span className="text-chalk-faint text-base font-sans font-medium tabular-nums">{chosen.size} selected</span>
          </h2>
          <div className="flex gap-3 text-sm">
            <button className="text-chalk-muted hover:text-chalk" onClick={() => setSelected(new Set(sorted.map(p => p.id)))}>
              Everyone
            </button>
            {latestCup && (
              <button className="text-chalk-muted hover:text-chalk" onClick={() => setSelected(new Set(latestCup.players.map(p => p.id)))}>
                Last cup's line-up
              </button>
            )}
            <button className="text-chalk-muted hover:text-chalk" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        </div>

        {isLoading ? (
          <Loading className="py-6" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {sorted.map(p => {
              const on = chosen.has(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    on ? 'border-gold/60 bg-gold/[0.12] text-chalk' : 'border-turf-line text-chalk-muted hover:text-chalk hover:border-chalk-faint',
                  )}
                >
                  {p.name}
                  <span className={cn('text-xs tabular-nums', on ? 'text-gold' : 'text-chalk-faint')}>{p.overrallRating}</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4 mt-6 pt-5 border-t border-turf-line">
          <fieldset>
            <legend className="field-label">Format</legend>
            <div className="flex gap-1 p-1 rounded-lg border border-turf-line">
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  aria-pressed={format === f.value}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    format === f.value ? 'bg-turf-raised text-chalk' : 'text-chalk-faint hover:text-chalk',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-chalk-faint mt-2">{FORMATS.find(f => f.value === format)!.hint}</p>
          </fieldset>
          <Button
            variant="primary"
            onClick={() => run.mutate()}
            loading={run.isPending}
            disabled={chosen.size < 2}
          >
            <Dices className="w-4 h-4" /> Simulate {SIMULATIONS.toLocaleString('en-US')} cups
          </Button>
        </div>
      </section>

      <div className="space-y-6">
        {run.data ? (
          <Results result={run.data} />
        ) : (
          <div className="panel border-dashed bg-transparent">
            <Empty
              title={chosen.size < 2 ? 'Pick at least two players' : 'Ready when you are'}
              hint={chosen.size < 2 ? undefined : 'Run the simulation to see everyone’s chances.'}
              className="py-14"
            />
          </div>
        )}
        <PowerRatingsPanel />
        <p className="text-xs leading-relaxed text-chalk-faint max-w-3xl px-1">
          How it works: every 1v1 result is used to estimate how many goals each player scores and concedes (a
          Poisson model). Duo matches aren't included. Tested on past cups using only earlier results, it picked the
          winner of 61% of matches. Penalties are treated as a coin flip.
        </p>
      </div>
    </>
  )
}
