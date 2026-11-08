import { matchPoints, matchWinnerId } from './match-result';
import type { MatchSide } from './match-result';

describe('matchPoints', () => {
  it('gives 3 to the side that scores more', () => {
    expect(matchPoints(3, 1)).toEqual({ first: 3, second: 0 });
    expect(matchPoints(0, 2)).toEqual({ first: 0, second: 3 });
  });

  it('gives 1 each for a draw without a shootout', () => {
    expect(matchPoints(2, 2)).toEqual({ first: 1, second: 1 });
    expect(matchPoints(2, 2, 0, 0)).toEqual({ first: 1, second: 1 });
    expect(matchPoints(1, 1, null, null)).toEqual({ first: 1, second: 1 });
  });

  it('decides a draw on penalties', () => {
    expect(matchPoints(1, 1, 5, 4)).toEqual({ first: 3, second: 0 });
    expect(matchPoints(1, 1, 3, 4)).toEqual({ first: 0, second: 3 });
  });

  it('ignores penalties when the score already has a winner', () => {
    expect(matchPoints(2, 1, 0, 5)).toEqual({ first: 3, second: 0 });
  });
});

describe('matchWinnerId', () => {
  const side = (
    participantId: string,
    goals: number,
    penaltyShootoutGoals?: number,
  ): MatchSide => ({
    participantId,
    goals,
    penaltyShootoutGoals,
  });

  it('returns the winning side', () => {
    expect(matchWinnerId(side('a', 3), side('b', 1))).toBe('a');
    expect(matchWinnerId(side('a', 2, 3), side('b', 2, 4))).toBe('b');
  });

  it('returns null for a draw', () => {
    expect(matchWinnerId(side('a', 1), side('b', 1))).toBeNull();
  });
});
