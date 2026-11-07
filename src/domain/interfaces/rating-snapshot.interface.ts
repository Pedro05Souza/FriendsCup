import type { DateTime } from 'luxon';

/** LEGACY_5: the old single overall from 1 to 5. POINTS_100: overall and attributes from 0 to 100. */
export type RatingScale = 'LEGACY_5' | 'POINTS_100';

export interface RatingSnapshotEntity {
  id: string;
  playerId: string;
  playerName: string;
  championshipId: string | null;
  championshipTitle: string | null;
  takenAt: DateTime;
  scale: RatingScale;
  /** The value as originally given (e.g. 4.7 on the old scale). */
  rawOverall: number;
  /** On the 0-100 scale (converted for old-scale ratings). */
  overall: number;
  attack: number | null;
  defense: number | null;
  intelligence: number | null;
  mentality: number | null;
}

export interface SaveRatingSnapshotParams {
  playerId: string;
  overall: number;
  attack: number;
  defense: number;
  intelligence: number;
  mentality: number;
}

export interface RatingSnapshotRepository {
  /** All snapshots, oldest first. */
  findAll(): Promise<RatingSnapshotEntity[]>;
  /** One player's snapshots, oldest first. */
  findByPlayer(playerId: string): Promise<RatingSnapshotEntity[]>;
  /** Saves (or replaces) each player's 0-100 rating as of the given cup. */
  saveForChampionship(
    championshipId: string,
    takenAt: DateTime,
    ratings: SaveRatingSnapshotParams[],
  ): Promise<void>;
}

export const ratingSnapshotRepositoryToken = Symbol('RatingSnapshotRepository');
