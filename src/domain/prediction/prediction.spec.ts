import {
  fitPoissonModel,
  predictMatch,
  type ModelMatch,
  type PoissonModel,
} from './poisson-model';
import { seededRandom, simulateCup, simulateScore } from './cup-simulator';

const day = (n: number): Date => new Date(Date.UTC(2025, 0, 1 + n));

function match(
  a: string,
  ga: number,
  gb: number,
  b: string,
  n = 0,
): ModelMatch {
  return { playerA: a, playerB: b, goalsA: ga, goalsB: gb, playedAt: day(n) };
}

/** A strong, a medium and a weak player who have all played each other often. */
function league(): ModelMatch[] {
  const out: ModelMatch[] = [];
  for (let i = 0; i < 6; i++) {
    out.push(match('strong', 4, 1, 'mid', i));
    out.push(match('strong', 5, 0, 'weak', i));
    out.push(match('mid', 3, 1, 'weak', i));
    out.push(match('mid', 2, 2, 'weak', i));
  }
  return out;
}

describe('fitPoissonModel / predictMatch', () => {
  const model = fitPoissonModel(league());

  it('orders players by strength', () => {
    const p = predictMatch(model, 'strong', 'weak');
    expect(p.winA).toBeGreaterThan(0.8);
    expect(p.expectedGoalsA).toBeGreaterThan(p.expectedGoalsB);
    expect(predictMatch(model, 'mid', 'weak').winA).toBeGreaterThan(0.5);
  });

  it('gives probabilities that add up to 1', () => {
    const p = predictMatch(model, 'mid', 'strong');
    expect(p.winA + p.draw + p.winB).toBeCloseTo(1, 10);
    const matrixTotal = p.scoreMatrix.flat().reduce((s, x) => s + x, 0);
    expect(matrixTotal).toBeLessThanOrEqual(1 + 1e-9);
    expect(matrixTotal).toBeGreaterThan(0.95);
  });

  it('is symmetric when sides are swapped', () => {
    const ab = predictMatch(model, 'strong', 'mid');
    const ba = predictMatch(model, 'mid', 'strong');
    expect(ab.winA).toBeCloseTo(ba.winB, 10);
    expect(ab.draw).toBeCloseTo(ba.draw, 10);
  });

  it('treats unknown players as league average', () => {
    const p = predictMatch(model, 'newcomer', 'other-newcomer');
    expect(p.winA).toBeCloseTo(p.winB, 10);
  });

  it('shrinks thin records towards average', () => {
    // One 6-0 win shouldn't make someone better than a player with a long record
    const m = fitPoissonModel([...league(), match('oneHit', 6, 0, 'weak', 7)]);
    expect(predictMatch(m, 'strong', 'oneHit').winA).toBeGreaterThan(0.5);
  });

  it('scales draws to how often they really happen', () => {
    const noDraws = fitPoissonModel(
      league().filter((m) => m.goalsA !== m.goalsB),
    );
    expect(noDraws.drawFactor).toBeLessThan(1);
    expect(predictMatch(noDraws, 'mid', 'weak').draw).toBeLessThan(
      predictMatch(
        fitPoissonModel(league(), { halfLifeYears: 2, priorSd: 0.35 }),
        'mid',
        'weak',
      ).draw,
    );
  });

  it('copes with no data', () => {
    const empty = fitPoissonModel([]);
    const p = predictMatch(empty, 'a', 'b');
    expect(p.winA).toBeCloseTo(p.winB, 10);
  });
});

describe('simulateScore', () => {
  it('reproduces the predicted win/draw/loss split', () => {
    const model = fitPoissonModel(league());
    const expected = predictMatch(model, 'mid', 'weak');
    const random = seededRandom(7);
    const n = 40000;
    let win = 0;
    let draw = 0;
    for (let i = 0; i < n; i++) {
      const [a, b] = simulateScore(model, 'mid', 'weak', random);
      if (a > b) win++;
      else if (a === b) draw++;
    }
    expect(win / n).toBeCloseTo(expected.winA, 1);
    expect(draw / n).toBeCloseTo(expected.draw, 1);
  });
});

describe('simulateCup', () => {
  const model: PoissonModel = fitPoissonModel(league());
  const players = ['strong', 'mid', 'weak', 'p4', 'p5'];

  it.each(['KNOCKOUT', 'GROUPS_AND_KNOCKOUT'] as const)(
    '%s: stage odds are consistent',
    (format) => {
      const odds = simulateCup(model, players, format, 3000, 1);
      const titles = odds.reduce((s, o) => s + o.title, 0);
      expect(titles).toBeCloseTo(1, 10);
      // Exactly two finalists and up to four semifinalists every run
      expect(odds.reduce((s, o) => s + o.final, 0)).toBeCloseTo(2, 10);
      for (const o of odds) {
        expect(o.title).toBeLessThanOrEqual(o.final);
        expect(o.final).toBeLessThanOrEqual(o.semifinal);
        expect(o.semifinal).toBeLessThanOrEqual(o.knockout);
      }
      expect(odds[0]!.playerId).toBe('strong');
    },
  );

  it('is reproducible with the same seed', () => {
    const a = simulateCup(model, players, 'KNOCKOUT', 500, 42);
    const b = simulateCup(model, players, 'KNOCKOUT', 500, 42);
    expect(a).toEqual(b);
  });

  it('handles odd numbers of players with byes', () => {
    const odds = simulateCup(
      model,
      ['strong', 'mid', 'weak'],
      'KNOCKOUT',
      1000,
      3,
    );
    expect(odds.reduce((s, o) => s + o.title, 0)).toBeCloseTo(1, 10);
    expect(odds.reduce((s, o) => s + o.final, 0)).toBeCloseTo(2, 10);
  });
});
