import { Dices, Link2, Trophy } from 'lucide-react'
import type { Match, PlayedCup } from '../types'
import { cn, fmtPhase } from '../lib/utils'
import BracketView from './BracketView'
import Button from './ui/Button'
import PlayerLink from './ui/PlayerLink'

/** "2–2 (4–3 pens)" from the first participant's side. */
function scoreline(m: Match, flip = false) {
  const [a, b] = flip ? [m.participants[1]!, m.participants[0]!] : [m.participants[0]!, m.participants[1]!]
  const pens = a.penaltyShootoutGoals !== undefined ? ` (${a.penaltyShootoutGoals}–${b.penaltyShootoutGoals} pens)` : ''
  return `${a.goals}–${b.goals}${pens}`
}

function GroupCard({ group }: { group: PlayedCup['groups'][number] }) {
  return (
    <div className="panel overflow-hidden">
      <h4 className="px-4 sm:px-5 pt-4 pb-2 font-display text-xl font-bold text-chalk">Group {group.name}</h4>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-chalk-faint text-xs">
              <th className="pl-4 sm:pl-5 pr-1 py-1.5 text-left font-semibold w-6">#</th>
              <th className="px-2 py-1.5 text-left font-semibold">Player</th>
              <th className="px-1.5 py-1.5 text-right font-semibold" title="Played">P</th>
              <th className="px-1.5 py-1.5 text-right font-semibold" title="Won">W</th>
              <th className="px-1.5 py-1.5 text-right font-semibold" title="Drawn">D</th>
              <th className="px-1.5 py-1.5 text-right font-semibold" title="Lost">L</th>
              <th className="px-1.5 py-1.5 text-right font-semibold">Goals</th>
              <th className="px-1.5 py-1.5 text-right font-semibold" title="Goal difference">GD</th>
              <th className="pl-1.5 pr-4 sm:pr-5 py-1.5 text-right font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.table.map((r, i) => {
              const gd = r.goalsFor - r.goalsAgainst
              return (
                <tr key={r.playerId} className="border-t border-turf-line/60">
                  <td className={cn('pl-4 sm:pl-5 pr-1 py-2 tabular-nums', r.qualified ? 'text-gold font-semibold' : 'text-chalk-faint')}>
                    {i + 1}
                  </td>
                  <td className="px-2 py-2">
                    <PlayerLink id={r.playerId} name={r.playerName} className={cn('font-medium whitespace-nowrap', r.qualified ? 'text-chalk' : 'text-chalk-muted')} />
                  </td>
                  <td className="px-1.5 py-2 text-right tabular-nums text-chalk-faint">{r.played}</td>
                  <td className="px-1.5 py-2 text-right tabular-nums text-chalk-muted">{r.won}</td>
                  <td className="px-1.5 py-2 text-right tabular-nums text-chalk-muted">{r.drawn}</td>
                  <td className="px-1.5 py-2 text-right tabular-nums text-chalk-muted">{r.lost}</td>
                  <td className="px-1.5 py-2 text-right tabular-nums text-chalk-muted whitespace-nowrap">
                    {r.goalsFor}:{r.goalsAgainst}
                  </td>
                  <td className={cn('px-1.5 py-2 text-right tabular-nums', gd > 0 ? 'text-win' : gd < 0 ? 'text-loss' : 'text-chalk-faint')}>
                    {gd > 0 ? '+' : ''}{gd}
                  </td>
                  <td className="pl-1.5 pr-4 sm:pr-5 py-2 text-right font-display text-xl font-extrabold tabular-nums text-chalk">{r.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ul className="mx-4 sm:mx-5 mt-2 mb-4 pt-3 border-t border-turf-line space-y-1">
        {group.matches.map(m => {
          const [a, b] = m.participants as [Match['participants'][number], Match['participants'][number]]
          const side = (p: typeof a, align: string) => (
            <span className={cn('truncate', align, m.winnerId === p.id ? 'text-chalk font-semibold' : 'text-chalk-muted')}>{p.name}</span>
          )
          return (
            <li key={m.id} className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 text-sm">
              {side(a, 'text-right')}
              <span className="font-display text-lg font-extrabold tabular-nums text-chalk w-12 text-center">
                {a.goals}–{b.goals}
              </span>
              {side(b, 'text-left')}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ChampionCard({ cup }: { cup: PlayedCup }) {
  const final = cup.knockout[cup.knockout.length - 1]
  const championFirst = final?.participants[0]?.id === cup.championId
  const wentToPens = final?.participants[0]?.penaltyShootoutGoals !== undefined

  // Every match the champion played, from their side
  const road = [...cup.groups.flatMap(g => g.matches), ...cup.knockout]
    .filter(m => m.participants.some(p => p.id === cup.championId))
    .map(m => {
      const flip = m.participants[0]!.id !== cup.championId
      const opponent = m.participants[flip ? 0 : 1]!
      const result = m.winnerId === cup.championId ? 'W' : m.winnerId === null ? 'D' : 'L'
      return { m, flip, opponent, result }
    })

  return (
    <section className="relative overflow-hidden panel border-gold/40 px-6 sm:px-8 py-7 bg-[linear-gradient(120deg,rgba(242,193,78,0.14),transparent_60%)]">
      <p className="flex items-center gap-2 text-sm font-semibold text-gold">
        <Trophy className="w-4 h-4" /> Champion
      </p>
      <p className="font-display text-6xl sm:text-7xl font-black leading-[0.85] text-chalk mt-3">
        <PlayerLink id={cup.championId} name={cup.championName} className="hover:no-underline" />
      </p>
      {final && cup.runnerUpId && (
        <p className="mt-3 text-chalk-muted">
          Beat <PlayerLink id={cup.runnerUpId} name={cup.runnerUpName ?? ''} className="text-chalk font-medium" /> in the final,{' '}
          <span className="text-chalk tabular-nums">{scoreline(final, !championFirst)}</span>
          {wentToPens && ' on penalties'}.
        </p>
      )}

      <h4 className="mt-6 mb-2 text-xs font-semibold text-chalk-faint">Road to the title</h4>
      <ol className="divide-y divide-turf-line/60 border-y border-turf-line/60 max-w-xl">
        {road.map(({ m, flip, opponent, result }) => (
          <li key={m.id} className="grid grid-cols-[7.5rem,1fr,auto,1.25rem] items-center gap-3 py-1.5 text-sm">
            <span className="text-chalk-faint text-xs">{fmtPhase(m.matchPhase)}</span>
            <span className="truncate text-chalk-muted">
              vs <PlayerLink id={opponent.id} name={opponent.name} className="text-chalk" />
            </span>
            <span className="tabular-nums text-chalk">{scoreline(m, flip)}</span>
            <span
              className={cn(
                'text-xs font-bold text-center',
                result === 'W' ? 'text-win' : result === 'L' ? 'text-loss' : 'text-draw',
              )}
            >
              {result}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** One simulated cup, shown like a real one: groups, every score, the bracket, the champion. */
export default function PlayedCupView({
  cup,
  playerCount,
  onCopyLink,
  onReplay,
  replaying,
}: {
  cup: PlayedCup
  playerCount: number
  onCopyLink: () => void
  onReplay: () => void
  replaying: boolean
}) {
  const shootouts = cup.knockout.filter(m => m.participants[0]?.penaltyShootoutGoals !== undefined).length
  const goals = [...cup.groups.flatMap(g => g.matches), ...cup.knockout].reduce(
    (s, m) => s + m.participants.reduce((t, p) => t + p.goals, 0),
    0,
  )
  const matchCount = cup.groups.reduce((s, g) => s + g.matches.length, 0) + cup.knockout.length

  return (
    <div className="space-y-6">
      <div className="panel px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-extrabold text-chalk">
            Cup <span className="text-gold tabular-nums">#{cup.seed}</span>
          </p>
          <p className="text-sm text-chalk-faint">
            {playerCount} players · {matchCount} matches · {goals} goals
            {shootouts > 0 && ` · ${shootouts} ${shootouts === 1 ? 'shootout' : 'shootouts'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onCopyLink}>
            <Link2 className="w-3.5 h-3.5" /> Copy link
          </Button>
          <Button size="sm" variant="subtle" onClick={onReplay} loading={replaying}>
            <Dices className="w-3.5 h-3.5" /> Play another
          </Button>
        </div>
      </div>

      {cup.groups.length > 0 && (
        <section>
          <h3 className="panel-title mb-3 px-1">Group stage</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {cup.groups.map(g => <GroupCard key={g.name} group={g} />)}
          </div>
          <p className="text-xs text-chalk-faint mt-2 px-1">
            Top two go through. Ties are split by goal difference, then goals scored, then drawing lots.
          </p>
        </section>
      )}

      {cup.knockout.length > 0 && (
        <BracketView matches={cup.knockout} title={`Simulated cup #${cup.seed}`} />
      )}

      <ChampionCard cup={cup} />
    </div>
  )
}
