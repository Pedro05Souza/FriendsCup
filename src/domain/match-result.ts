/**
 * League points for one match, from each side's goals and (optional)
 * penalty shootout goals. Mirrors the rules used when a match is created:
 * a win (including on penalties) is worth 3, a draw 1 each.
 */
export function matchPoints(
  firstGoals: number,
  secondGoals: number,
  firstPenalties?: number | null,
  secondPenalties?: number | null,
): { first: number; second: number } {
  if (firstGoals > secondGoals) return { first: 3, second: 0 };
  if (firstGoals < secondGoals) return { first: 0, second: 3 };

  if (
    firstPenalties !== undefined &&
    firstPenalties !== null &&
    secondPenalties !== undefined &&
    secondPenalties !== null
  ) {
    if (firstPenalties > secondPenalties) return { first: 3, second: 0 };
    if (firstPenalties < secondPenalties) return { first: 0, second: 3 };
  }

  return { first: 1, second: 1 };
}

/** One side of a match: a player in 1v1 cups, a duo in 2v2 cups. */
export interface MatchSide {
  participantId: string;
  goals: number;
  penaltyShootoutGoals?: number | null;
}

/** The winning side's id, or null for a draw. */
export function matchWinnerId(
  first: MatchSide,
  second: MatchSide,
): string | null {
  const points = matchPoints(
    first.goals,
    second.goals,
    first.penaltyShootoutGoals,
    second.penaltyShootoutGoals,
  );
  if (points.first > points.second) return first.participantId;
  if (points.second > points.first) return second.participantId;
  return null;
}
