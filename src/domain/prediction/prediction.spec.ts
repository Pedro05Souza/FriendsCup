import {
  fitPoissonModel,
  predictMatch,
  type ModelMatch,
  type PoissonModel,
} from './poisson-model';
import {
  playCup,
  seededRandom,
  simulateCup,
  simulateScore,
  simulateShootout,
} from './cup-simulator';

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

describe('simulateShootout', () => {
  it('always has a winner, with sensible scores', () => {
    const random = seededRandom(11);
    let firstWins = 0;
    for (let i = 0; i < 20000; i++) {
      const [a, b] = simulateShootout(random);
      expect(a).not.toBe(b);
      // Within the first five kicks a side can't lead by more than it could catch
      if (a <= 5 && b <= 5) expect(Math.abs(a - b)).toBeLessThanOrEqual(3);
      if (a > b) firstWins++;
    }
    expect(firstWins / 20000).toBeGreaterThan(0.47);
    expect(firstWins / 20000).toBeLessThan(0.53);
  });
});

describe('playCup', () => {
  const model: PoissonModel = fitPoissonModel(league());
  const six = ['strong', 'mid', 'weak', 'p4', 'p5', 'p6'];

  it('plays a knockout with byes and a champion who won the final', () => {
    const cup = playCup(model, six, 'KNOCKOUT', 5);
    expect(cup.groups).toEqual([]);
    // 6 players: 2 quarter-finals (two byes), 2 semis, a final
    expect(cup.knockout.map((m) => m.phase)).toEqual([
      'QUARTER_FINALS',
      'QUARTER_FINALS',
      'SEMIFINALS',
      'SEMIFINALS',
      'FINALS',
    ]);
    const final = cup.knockout.at(-1)!;
    expect(final.winnerId).toBe(cup.championId);
    expect([final.home, final.away]).toContain(cup.runnerUpId);
    for (const m of cup.knockout) {
      const level = m.homeGoals === m.awayGoals;
      expect(m.shootout !== null).toBe(level);
      const homeWon = level
        ? m.shootout![0] > m.shootout![1]
        : m.homeGoals > m.awayGoals;
      expect(m.winnerId).toBe(homeWon ? m.home : m.away);
    }
  });

  it('plays groups whose tables add up, then the top two go through', () => {
    const cup = playCup(model, [...six, 'p7', 'p8'], 'GROUPS_AND_KNOCKOUT', 9);
    expect(cup.groups.map((g) => g.name)).toEqual(['A', 'B']);
    for (const g of cup.groups) {
      expect(g.matches).toHaveLength(6);
      const points = g.table.reduce((s, r) => s + r.points, 0);
      const draws = g.matches.filter((m) => m.winnerId === null).length;
      expect(points).toBe(6 * 3 - draws);
      expect(g.table.filter((r) => r.qualified)).toHaveLength(2);
      expect(g.table[0]!.points).toBeGreaterThanOrEqual(g.table[1]!.points);
    }
    const qualified = cup.groups.flatMap((g) =>
      g.table.filter((r) => r.qualified).map((r) => r.playerId),
    );
    const semis = cup.knockout.filter((m) => m.phase === 'SEMIFINALS');
    expect(semis.flatMap((m) => [m.home, m.away]).sort()).toEqual(
      qualified.sort(),
    );
  });

  it('gives byes to group winners, not runners-up', () => {
    const ten = [...six, 'p7', 'p8', 'p9', 'p10'];
    for (let seed = 0; seed < 30; seed++) {
      const cup = playCup(model, ten, 'GROUPS_AND_KNOCKOUT', seed);
      // 3 groups → 6 qualifiers → 2 byes straight into the semis
      const quarters = cup.knockout.filter((m) => m.phase === 'QUARTER_FINALS');
      expect(quarters).toHaveLength(2);
      const playedQuarter = new Set(quarters.flatMap((m) => [m.home, m.away]));
      const winners = cup.groups.map((g) => g.table[0]!.playerId);
      const byes = winners.filter((id) => !playedQuarter.has(id));
      expect(byes).toHaveLength(2);
      // Each bye player meets a quarter-final winner, not the other bye player
      for (const m of cup.knockout.filter((x) => x.phase === 'SEMIFINALS')) {
        expect(byes.includes(m.home) && byes.includes(m.away)).toBe(false);
      }
      // No group pairing in a quarter-final
      for (const m of quarters) {
        const group = (id: string): string =>
          cup.groups.find((g) => g.table.some((r) => r.playerId === id))!.name;
        expect(group(m.home)).not.toBe(group(m.away));
      }
    }
  });

  it('spreads byes across both halves of the bracket', () => {
    const ten = [...six, 'p7', 'p8', 'p9', 'p10'];
    const cup = playCup(model, ten, 'KNOCKOUT', 3);
    // 10 players → 16 slots: 2 round-of-16 ties, one in each half
    const r16 = cup.knockout.filter((m) => m.phase === 'ROUND_OF_16');
    expect(r16).toHaveLength(2);
    const quarters = cup.knockout.filter((m) => m.phase === 'QUARTER_FINALS');
    const half = (m: (typeof quarters)[number]): number =>
      quarters.indexOf(m) < 2 ? 0 : 1;
    const fedHalves = r16.map((t) =>
      half(quarters.find((q) => [q.home, q.away].includes(t.winnerId!))!),
    );
    expect(new Set(fedHalves).size).toBe(2);
  });

  it('gives the same cup for the same seed', () => {
    expect(playCup(model, six, 'KNOCKOUT', 77)).toEqual(
      playCup(model, six, 'KNOCKOUT', 77),
    );
  });
});
