import type { PoissonModel } from './poisson-model';
import { expectedGoals, samplePoisson } from './poisson-model';

export type CupFormat = 'KNOCKOUT' | 'GROUPS_AND_KNOCKOUT';

export interface CupOdds {
  playerId: string;
  /** Share of simulations this player won the cup. */
  title: number;
  /** Reached the final. */
  final: number;
  /** Reached the semifinals. */
  semifinal: number;
  /** Got out of the group (always 1 in a straight knockout). */
  knockout: number;
}

/** Small, fast, seedable PRNG (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * One simulated scoreline, drawn from the same distribution as
 * predictMatch: independent Poisson goals with draws scaled by the model's
 * draw factor (via rejection sampling).
 */
export function simulateScore(
  model: PoissonModel,
  a: string,
  b: string,
  random: () => number,
): [number, number] {
  const xg = expectedGoals(model, a, b);
  const k = model.drawFactor;
  const scale = Math.max(k, 1);
  for (;;) {
    const ga = samplePoisson(xg.a, random);
    const gb = samplePoisson(xg.b, random);
    const accept = (ga === gb ? k : 1) / scale;
    if (random() < accept) return [ga, gb];
  }
}

/** One match of a simulated cup. */
export interface SimulatedMatch {
  phase: string;
  /** Group name for group-stage matches, e.g. "A". */
  group: string | null;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  /** Shootout score, when a knockout match ended level. */
  shootout: [number, number] | null;
  /** Null for a group-stage draw. */
  winnerId: string | null;
}

export interface SimulatedGroupRow {
  playerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  qualified: boolean;
}

export interface SimulatedGroup {
  name: string;
  /** Final standings, top first. */
  table: SimulatedGroupRow[];
  matches: SimulatedMatch[];
}

export interface SimulatedCup {
  groups: SimulatedGroup[];
  /** Knockout matches, round by round, in bracket order. Byes have no match. */
  knockout: SimulatedMatch[];
  championId: string;
  runnerUpId: string | null;
}

/** Share of penalties scored, roughly what real shootouts show. */
const PENALTY_CONVERSION = 0.75;

/**
 * A penalty shootout: five kicks each, taken in turn and stopped once one side
 * can't catch up, then sudden death. Returns [first side, second side].
 */
export function simulateShootout(random: () => number): [number, number] {
  let a = 0;
  let b = 0;
  for (let kick = 0; kick < 5; kick++) {
    const left = 5 - kick - 1;
    if (random() < PENALTY_CONVERSION) a++;
    if (a > b + left + 1 || b > a + left) return [a, b];
    if (random() < PENALTY_CONVERSION) b++;
    if (Math.abs(a - b) > left) return [a, b];
  }
  for (;;) {
    const sa = random() < PENALTY_CONVERSION;
    const sb = random() < PENALTY_CONVERSION;
    if (sa) a++;
    if (sb) b++;
    if (sa !== sb) return [a, b];
  }
}

/** Phase name for a knockout round by how many bracket slots it has. */
export function knockoutPhase(slots: number): string {
  switch (slots) {
    case 2:
      return 'FINALS';
    case 4:
      return 'SEMIFINALS';
    case 8:
      return 'QUARTER_FINALS';
    case 16:
      return 'ROUND_OF_16';
    default:
      return `ROUND_OF_${slots}`;
  }
}

/** A knockout tie: a draw goes to a penalty shootout. */
function playKnockout(
  model: PoissonModel,
  a: string,
  b: string,
  phase: string,
  random: () => number,
): SimulatedMatch {
  const [ga, gb] = simulateScore(model, a, b, random);
  let shootout: [number, number] | null = null;
  let winnerId: string;
  if (ga !== gb) {
    winnerId = ga > gb ? a : b;
  } else {
    shootout = simulateShootout(random);
    winnerId = shootout[0] > shootout[1] ? a : b;
  }
  return {
    phase,
    group: null,
    home: a,
    away: b,
    homeGoals: ga,
    awayGoals: gb,
    shootout,
    winnerId,
  };
}

/**
 * Runs a bracket. `reached` records, for each player, the deepest round they
 * got to, as rounds left (1 = the final, 2 = the semis); a bye counts.
 */
function playBracket(
  model: PoissonModel,
  entrants: string[],
  random: () => number,
  reached: Map<string, number>,
): { champion: string; matches: SimulatedMatch[] } {
  // Pad to a power of two with byes, spread so byes don't meet each other
  let size = 1;
  while (size < entrants.length) size *= 2;
  let round: Array<string | null> = [...entrants];
  while (round.length < size) round.push(null);
  round = interleaveByes(round);

  const matches: SimulatedMatch[] = [];
  while (round.length > 1) {
    const roundsLeft = Math.log2(round.length);
    const phase = knockoutPhase(round.length);
    for (const id of round) {
      if (id)
        reached.set(id, Math.min(reached.get(id) ?? Infinity, roundsLeft));
    }
    const next: Array<string | null> = [];
    for (let i = 0; i < round.length; i += 2) {
      const a = round[i] ?? null;
      const b = round[i + 1] ?? null;
      if (a && b) {
        const match = playKnockout(model, a, b, phase, random);
        matches.push(match);
        next.push(match.winnerId);
      } else next.push(a ?? b);
    }
    round = next;
  }
  return { champion: round[0]!, matches };
}

/**
 * Gives the first entrants byes and spreads the played ties evenly through
 * the bracket (both halves, then each quarter, ...), as a seeded draw does,
 * so a bye player meets the winner of a played tie next where possible.
 */
function interleaveByes(slots: Array<string | null>): Array<string | null> {
  const players = slots.filter((s): s is string => s !== null);
  const byes = slots.length - players.length;
  const byePairs = players.slice(0, byes).map((id) => [id, null]);
  const ties: Array<Array<string | null>> = [];
  for (let i = byes; i < players.length; i += 2)
    ties.push([players[i]!, players[i + 1] ?? null]);

  const pairs = slots.length / 2;
  const tieSlots = new Set(spreadOrder(pairs).slice(0, ties.length));
  const out: Array<string | null> = [];
  for (let pos = 0; pos < pairs; pos++) {
    out.push(...(tieSlots.has(pos) ? ties.shift()! : byePairs.shift()!));
  }
  return out;
}

/** 0..n-1 (n a power of two) in bit-reversed order: 8 → 0 4 2 6 1 5 3 7. */
function spreadOrder(n: number): number[] {
  const bits = Math.log2(n);
  return Array.from({ length: n }, (_, i) => {
    let r = 0;
    for (let b = 0; b < bits; b++) if (i & (1 << b)) r |= 1 << (bits - 1 - b);
    return r;
  });
}

/**
 * Splits players into groups of about four, plays each as a single round
 * robin, and returns the groups plus the knockout line-up (top two of each).
 */
function playGroups(
  model: PoissonModel,
  players: string[],
  random: () => number,
): { groups: SimulatedGroup[]; bracket: string[] } {
  const groupCount = Math.max(1, Math.round(players.length / 4));
  const drawn = shuffle(players, random);
  const members: string[][] = Array.from({ length: groupCount }, () => []);
  drawn.forEach((id, i) => members[i % groupCount]!.push(id));

  const groups: SimulatedGroup[] = [];
  const winners: string[] = [];
  const runnersUp: string[] = [];
  members.forEach((group, g) => {
    const name = String.fromCharCode(65 + g);
    const table = new Map<string, SimulatedGroupRow>(
      group.map((id) => [
        id,
        {
          playerId: id,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          qualified: false,
        },
      ]),
    );
    const matches: SimulatedMatch[] = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]!;
        const b = group[j]!;
        const [ga, gb] = simulateScore(model, a, b, random);
        const ta = table.get(a)!;
        const tb = table.get(b)!;
        ta.played++;
        tb.played++;
        ta.goalsFor += ga;
        ta.goalsAgainst += gb;
        tb.goalsFor += gb;
        tb.goalsAgainst += ga;
        if (ga > gb) {
          ta.won++;
          tb.lost++;
          ta.points += 3;
        } else if (gb > ga) {
          tb.won++;
          ta.lost++;
          tb.points += 3;
        } else {
          ta.drawn++;
          tb.drawn++;
          ta.points += 1;
          tb.points += 1;
        }
        matches.push({
          phase: 'GROUP_STAGE',
          group: name,
          home: a,
          away: b,
          homeGoals: ga,
          awayGoals: gb,
          shootout: null,
          winnerId: ga > gb ? a : gb > ga ? b : null,
        });
      }
    }
    // Points, goal difference, goals scored, then drawing lots
    const lots = new Map(group.map((id) => [id, random()]));
    const ranked = [...table.values()].sort(
      (x, y) =>
        y.points - x.points ||
        y.goalsFor - y.goalsAgainst - (x.goalsFor - x.goalsAgainst) ||
        y.goalsFor - x.goalsFor ||
        lots.get(x.playerId)! - lots.get(y.playerId)!,
    );
    ranked.slice(0, 2).forEach((row) => (row.qualified = true));
    winners.push(ranked[0]!.playerId);
    if (ranked[1]) runnersUp.push(ranked[1].playerId);
    groups.push({ name, table: ranked, matches });
  });

  // Byes go to the best group winners (then the best runners-up)
  const qualified = winners.length + runnersUp.length;
  let size = 1;
  while (size < qualified) size *= 2;
  const byes = size - qualified;
  const groupOf = new Map(
    groups.flatMap((g) => g.table.map((r) => [r.playerId, g.name] as const)),
  );
  const row = (id: string): SimulatedGroupRow =>
    groups.flatMap((g) => g.table).find((r) => r.playerId === id)!;
  const best = (x: string, y: string): number => {
    const rx = row(x);
    const ry = row(y);
    return (
      ry.points / ry.played - rx.points / rx.played ||
      (ry.goalsFor - ry.goalsAgainst) / ry.played -
        (rx.goalsFor - rx.goalsAgainst) / rx.played ||
      ry.goalsFor / ry.played - rx.goalsFor / rx.played
    );
  };
  const byWinners = [...winners].sort(best);
  const byRunners = [...runnersUp].sort(best);
  const seeded = [...byWinners, ...byRunners].slice(0, byes);
  const restWinners = byWinners.filter((id) => !seeded.includes(id));
  const restRunners = shuffle(
    byRunners.filter((id) => !seeded.includes(id)),
    random,
  );

  // The rest: each winner meets a runner-up from another group where possible
  const bracket: string[] = [...seeded];
  for (const w of restWinners) {
    const other = restRunners.findIndex(
      (r) => groupOf.get(r) !== groupOf.get(w),
    );
    const [r] = restRunners.splice(Math.max(other, 0), 1);
    bracket.push(w);
    if (r) bracket.push(r);
  }
  bracket.push(...restRunners);
  return { groups, bracket };
}

function runCup(
  model: PoissonModel,
  players: string[],
  format: CupFormat,
  random: () => number,
): SimulatedCup & { entrants: string[]; reached: Map<string, number> } {
  const useGroups = format === 'GROUPS_AND_KNOCKOUT' && players.length >= 4;
  const { groups, bracket } = useGroups
    ? playGroups(model, players, random)
    : { groups: [], bracket: shuffle(players, random) };

  const reached = new Map<string, number>();
  const { champion, matches } = playBracket(model, bracket, random, reached);
  const final = matches.at(-1);
  const runnerUpId = final
    ? final.winnerId === final.home
      ? final.away
      : final.home
    : null;
  return {
    groups,
    knockout: matches,
    championId: champion,
    runnerUpId,
    entrants: bracket,
    reached,
  };
}

/**
 * Plays one whole cup, match by match. The same seed and inputs always give
 * the same cup, so a run can be shared.
 */
export function playCup(
  model: PoissonModel,
  players: string[],
  format: CupFormat,
  seed: number,
): SimulatedCup {
  const { groups, knockout, championId, runnerUpId } = runCup(
    model,
    players,
    format,
    seededRandom(seed),
  );
  return { groups, knockout, championId, runnerUpId };
}

/**
 * Simulates a cup many times and reports how often each player reached each
 * stage. The draw is random in every run.
 */
export function simulateCup(
  model: PoissonModel,
  players: string[],
  format: CupFormat,
  simulations: number,
  seed: number,
): CupOdds[] {
  const random = seededRandom(seed);
  const counts = new Map(
    players.map((id) => [
      id,
      { title: 0, final: 0, semifinal: 0, knockout: 0 },
    ]),
  );

  for (let run = 0; run < simulations; run++) {
    const {
      entrants,
      reached,
      championId: champion,
    } = runCup(model, players, format, random);

    for (const id of entrants) counts.get(id)!.knockout++;
    for (const [id, roundsLeft] of reached) {
      const c = counts.get(id)!;
      if (roundsLeft <= 2) c.semifinal++;
      if (roundsLeft <= 1) c.final++;
    }
    counts.get(champion)!.title++;
  }

  return players
    .map((id) => {
      const c = counts.get(id)!;
      return {
        playerId: id,
        title: c.title / simulations,
        final: c.final / simulations,
        semifinal: c.semifinal / simulations,
        knockout: c.knockout / simulations,
      };
    })
    .sort((x, y) => y.title - x.title || y.final - x.final);
}
