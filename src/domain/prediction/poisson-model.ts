/**
 * Poisson model of 1v1 scorelines.
 *
 * Each player gets an attack and a defence strength. The goals a scores
 * against b follow a Poisson distribution with mean
 *
 *   λ(a → b) = exp(μ + attack[a] − defence[b])
 *
 * Strengths are fitted by maximum likelihood with two adjustments that matter
 * for a small group with few matches:
 *   - a Gaussian prior pulls every strength towards 0 (league average), so a
 *     player with three matches can't get an extreme rating;
 *   - older matches count less (exponential decay by the cup's date), so the
 *     model follows who is good now.
 *
 * Independent Poisson scores predict far more draws than these FIFA games
 * produce, so draw scorelines are scaled by a fitted factor (observed draw
 * rate / predicted draw rate) and the distribution renormalised.
 */

export interface ModelMatch {
  playerA: string;
  playerB: string;
  goalsA: number;
  goalsB: number;
  /** When the match was played (the cup's date). */
  playedAt: Date;
}

export interface ModelOptions {
  /** Years for a match's weight to halve. */
  halfLifeYears: number;
  /** Prior standard deviation of a strength (log scale). Smaller = more shrinkage. */
  priorSd: number;
  /** Date weights are measured from; defaults to the newest match. */
  asOf?: Date;
}

export const DEFAULT_MODEL_OPTIONS: ModelOptions = {
  halfLifeYears: 2,
  priorSd: 0.35,
};

export interface PoissonModel {
  /** Log of the average goals a player scores in a match. */
  mu: number;
  attack: Map<string, number>;
  defence: Map<string, number>;
  /** Matches each player has in the data (unweighted). */
  matches: Map<string, number>;
  /** Multiplier on every draw scoreline (1 = plain Poisson). */
  drawFactor: number;
}

const YEAR_MS = 365.25 * 24 * 3600 * 1000;

export function fitPoissonModel(
  data: ModelMatch[],
  options: ModelOptions = DEFAULT_MODEL_OPTIONS,
): PoissonModel {
  const attack = new Map<string, number>();
  const defence = new Map<string, number>();
  const matches = new Map<string, number>();

  for (const m of data) {
    for (const id of [m.playerA, m.playerB]) {
      attack.set(id, 0);
      defence.set(id, 0);
      matches.set(id, (matches.get(id) ?? 0) + 1);
    }
  }

  if (data.length === 0) {
    return { mu: Math.log(1.5), attack, defence, matches, drawFactor: 1 };
  }

  const asOf =
    options.asOf ??
    new Date(Math.max(...data.map((m) => m.playedAt.getTime())));

  // Each match gives two observations: goals scored by A against B, and by B against A
  const obs = data.flatMap((m) => {
    const ageYears = Math.max(
      0,
      (asOf.getTime() - m.playedAt.getTime()) / YEAR_MS,
    );
    const weight = Math.pow(0.5, ageYears / options.halfLifeYears);
    return [
      { scorer: m.playerA, conceder: m.playerB, goals: m.goalsA, weight },
      { scorer: m.playerB, conceder: m.playerA, goals: m.goalsB, weight },
    ];
  });

  const totalWeight = obs.reduce((s, o) => s + o.weight, 0);
  const weightedGoals = obs.reduce((s, o) => s + o.weight * o.goals, 0);
  let mu = Math.log(Math.max(weightedGoals / totalWeight, 0.1));

  const precision = 1 / (options.priorSd * options.priorSd);
  const rate = (o: (typeof obs)[number]): number =>
    Math.exp(mu + attack.get(o.scorer)! - defence.get(o.conceder)!);

  // Coordinate-wise Newton steps on the penalised log-likelihood
  for (let iter = 0; iter < 200; iter++) {
    let maxStep = 0;

    // μ (no prior)
    {
      let grad = 0;
      let hess = 0;
      for (const o of obs) {
        const r = rate(o);
        grad += o.weight * (o.goals - r);
        hess += o.weight * r;
      }
      const step = grad / hess;
      mu += step;
      maxStep = Math.max(maxStep, Math.abs(step));
    }

    for (const id of attack.keys()) {
      let grad = -precision * attack.get(id)!;
      let hess = precision;
      for (const o of obs) {
        if (o.scorer !== id) continue;
        const r = rate(o);
        grad += o.weight * (o.goals - r);
        hess += o.weight * r;
      }
      const step = grad / hess;
      attack.set(id, attack.get(id)! + step);
      maxStep = Math.max(maxStep, Math.abs(step));
    }

    for (const id of defence.keys()) {
      // d/d(defence) of log λ is −1, so the signs flip
      let grad = -precision * defence.get(id)!;
      let hess = precision;
      for (const o of obs) {
        if (o.conceder !== id) continue;
        const r = rate(o);
        grad += o.weight * (r - o.goals);
        hess += o.weight * r;
      }
      const step = grad / hess;
      defence.set(id, defence.get(id)! + step);
      maxStep = Math.max(maxStep, Math.abs(step));
    }

    if (maxStep < 1e-7) break;
  }

  const model: PoissonModel = { mu, attack, defence, matches, drawFactor: 1 };
  model.drawFactor = fitDrawFactor(model, data, asOf, options.halfLifeYears);
  return model;
}

/**
 * Observed vs predicted draws over the training matches, smoothed by one
 * pseudo-draw on each side so a handful of matches can't push it to 0.
 */
function fitDrawFactor(
  model: PoissonModel,
  data: ModelMatch[],
  asOf: Date,
  halfLifeYears: number,
): number {
  let observed = 1;
  let predicted = 1;
  for (const m of data) {
    const ageYears = Math.max(
      0,
      (asOf.getTime() - m.playedAt.getTime()) / YEAR_MS,
    );
    const weight = Math.pow(0.5, ageYears / halfLifeYears);
    observed += weight * (m.goalsA === m.goalsB ? 1 : 0);
    predicted += weight * rawOutcomes(model, m.playerA, m.playerB).draw;
  }
  return observed / predicted;
}

/** Expected goals for each side. Unknown players are treated as league average. */
export function expectedGoals(
  model: PoissonModel,
  a: string,
  b: string,
): { a: number; b: number } {
  const att = (id: string): number => model.attack.get(id) ?? 0;
  const def = (id: string): number => model.defence.get(id) ?? 0;
  return {
    a: Math.exp(model.mu + att(a) - def(b)),
    b: Math.exp(model.mu + att(b) - def(a)),
  };
}

function poissonPmf(lambda: number, maxGoals: number): number[] {
  const p = [Math.exp(-lambda)];
  for (let k = 1; k <= maxGoals; k++) p.push((p[k - 1]! * lambda) / k);
  return p;
}

export interface MatchPrediction {
  expectedGoalsA: number;
  expectedGoalsB: number;
  winA: number;
  draw: number;
  winB: number;
  /** P(a scores i, b scores j) for i, j in 0..maxGoals. */
  scoreMatrix: number[][];
}

/**
 * Win / draw / loss probabilities and the full scoreline distribution.
 * Goals are capped at `maxGoals` for the matrix; the probabilities still
 * account for the tail beyond it.
 */
export function predictMatch(
  model: PoissonModel,
  a: string,
  b: string,
  maxGoals = 10,
): MatchPrediction {
  const xg = expectedGoals(model, a, b);
  const raw = rawOutcomes(model, a, b);
  const k = model.drawFactor;
  const total = raw.winA + k * raw.draw + raw.winB;

  const pa = poissonPmf(xg.a, maxGoals);
  const pb = poissonPmf(xg.b, maxGoals);
  const scoreMatrix = Array.from({ length: maxGoals + 1 }, (_, i) =>
    Array.from(
      { length: maxGoals + 1 },
      (_, j) => (pa[i]! * pb[j]! * (i === j ? k : 1)) / total,
    ),
  );

  return {
    expectedGoalsA: xg.a,
    expectedGoalsB: xg.b,
    winA: raw.winA / total,
    draw: (k * raw.draw) / total,
    winB: raw.winB / total,
    scoreMatrix,
  };
}

/** Plain independent-Poisson outcome probabilities (no draw adjustment). */
function rawOutcomes(
  model: PoissonModel,
  a: string,
  b: string,
): { winA: number; draw: number; winB: number } {
  const xg = expectedGoals(model, a, b);
  const cap = 30;
  const pa = poissonPmf(xg.a, cap);
  const pb = poissonPmf(xg.b, cap);
  let winA = 0;
  let draw = 0;
  let winB = 0;
  for (let i = 0; i <= cap; i++) {
    for (let j = 0; j <= cap; j++) {
      const p = pa[i]! * pb[j]!;
      if (i > j) winA += p;
      else if (i < j) winB += p;
      else draw += p;
    }
  }
  return { winA, draw, winB };
}

/** Draw a Poisson-distributed count (Knuth's method; fine for the means seen here). */
export function samplePoisson(lambda: number, random: () => number): number {
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = random();
  while (p > limit) {
    k++;
    p *= random();
  }
  return k;
}
