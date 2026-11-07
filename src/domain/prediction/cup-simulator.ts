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

/** A knockout tie: a draw goes to penalties, treated as a coin flip. */
function playKnockout(
  model: PoissonModel,
  a: string,
  b: string,
  random: () => number,
): string {
  const [ga, gb] = simulateScore(model, a, b, random);
  if (ga !== gb) return ga > gb ? a : b;
  return random() < 0.5 ? a : b;
}

/**
 * Runs a bracket and returns the champion. `reached` records, for each player,
 * the deepest round they played, as rounds left (1 = the final, 2 = semis).
 */
function playBracket(
  model: PoissonModel,
  entrants: string[],
  random: () => number,
  reached: Map<string, number>,
): string {
  // Pad to a power of two with byes, spread so byes don't meet each other
  let size = 1;
  while (size < entrants.length) size *= 2;
  let round: Array<string | null> = [...entrants];
  while (round.length < size) round.push(null);
  round = interleaveByes(round);

  while (round.length > 1) {
    const roundsLeft = Math.log2(round.length);
    for (const id of round) {
      if (id)
        reached.set(id, Math.min(reached.get(id) ?? Infinity, roundsLeft));
    }
    const next: Array<string | null> = [];
    for (let i = 0; i < round.length; i += 2) {
      const a = round[i] ?? null;
      const b = round[i + 1] ?? null;
      if (a && b) next.push(playKnockout(model, a, b, random));
      else next.push(a ?? b);
    }
    round = next;
  }
  return round[0]!;
}

/** Put byes opposite real entrants: [p1, p2, p3, null] → [p1, null, p2, p3]. */
function interleaveByes(slots: Array<string | null>): Array<string | null> {
  const players = slots.filter((s): s is string => s !== null);
  const byes = slots.length - players.length;
  const out: Array<string | null> = [];
  let p = 0;
  for (let i = 0; i < slots.length / 2; i++) {
    out.push(players[p++] ?? null);
    out.push(i < byes ? null : (players[p++] ?? null));
  }
  return out;
}

/** Splits players into groups of about four and returns the top two of each. */
function playGroups(
  model: PoissonModel,
  players: string[],
  random: () => number,
): string[] {
  const groupCount = Math.max(1, Math.round(players.length / 4));
  const drawn = shuffle(players, random);
  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  drawn.forEach((id, i) => groups[i % groupCount]!.push(id));

  const winners: string[] = [];
  const runnersUp: string[] = [];
  for (const group of groups) {
    const table = new Map(group.map((id) => [id, { points: 0, gd: 0, gf: 0 }]));
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]!;
        const b = group[j]!;
        const [ga, gb] = simulateScore(model, a, b, random);
        const ta = table.get(a)!;
        const tb = table.get(b)!;
        ta.gf += ga;
        tb.gf += gb;
        ta.gd += ga - gb;
        tb.gd += gb - ga;
        if (ga > gb) ta.points += 3;
        else if (gb > ga) tb.points += 3;
        else {
          ta.points += 1;
          tb.points += 1;
        }
      }
    }
    const ranked = [...group].sort((x, y) => {
      const tx = table.get(x)!;
      const ty = table.get(y)!;
      return (
        ty.points - tx.points ||
        ty.gd - tx.gd ||
        ty.gf - tx.gf ||
        random() - 0.5
      );
    });
    winners.push(ranked[0]!);
    if (ranked[1]) runnersUp.push(ranked[1]);
  }

  // Group winners meet runners-up from other groups where possible
  const shuffledRunners = shuffle(runnersUp, random);
  if (groupCount > 1) shuffledRunners.push(shuffledRunners.shift()!);
  const bracket: string[] = [];
  winners.forEach((w, i) => {
    bracket.push(w);
    if (shuffledRunners[i]) bracket.push(shuffledRunners[i]);
  });
  return bracket;
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
    const entrants =
      format === 'GROUPS_AND_KNOCKOUT' && players.length >= 4
        ? playGroups(model, players, random)
        : shuffle(players, random);

    const reached = new Map<string, number>();
    const champion = playBracket(model, entrants, random, reached);

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
