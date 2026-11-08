import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import {
  RatingSnapshotEntity,
  RatingSnapshotRepository,
  ratingSnapshotRepositoryToken,
  SaveRatingSnapshotParams,
} from 'src/domain/interfaces/rating-snapshot.interface';
import { DuoEntity, PlayerEntity } from 'src/domain/entities/player.entity';
import {
  ChampionshipRatingChangesDto,
  RatingHistoryDto,
  RatingPointDto,
} from '../dtos/rating-history.dto';

function toPoint(s: RatingSnapshotEntity): RatingPointDto {
  return {
    championshipId: s.championshipId,
    championshipTitle: s.championshipTitle,
    takenAtIso: s.takenAt.toISO() ?? new Date().toISOString(),
    scale: s.scale,
    rawOverall: s.rawOverall,
    overall: s.overall,
    attack: s.attack,
    defense: s.defense,
    intelligence: s.intelligence,
    mentality: s.mentality,
  };
}

/** Change on the original scale, rounded to that scale's precision. */
function rawDelta(
  before: RatingSnapshotEntity,
  after: RatingSnapshotEntity,
): number | null {
  if (before.scale !== after.scale) return null;
  const diff = after.rawOverall - before.rawOverall;
  return after.scale === 'LEGACY_5'
    ? Math.round(diff * 10) / 10
    : Math.round(diff);
}

/**
 * Players' ratings over time: the history for one player, how ratings moved
 * after a cup, and saving today's ratings as the ratings after the latest cup.
 */
@Injectable()
export class RatingHistoryUsecase {
  constructor(
    @Inject(ratingSnapshotRepositoryToken)
    private readonly _snapshots: RatingSnapshotRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getPlayerHistory(playerId: string): Promise<RatingHistoryDto> {
    const player = await this._playerRepository.findById(playerId);
    if (player === null) {
      throw new BadRequestException(
        `Player with ID ${playerId} does not exist.`,
      );
    }

    const snapshots = await this._snapshots.findByPlayer(playerId);
    return {
      playerId: player.id,
      playerName: player.name,
      snapshots: snapshots.map(toPoint),
      current: {
        overall: player.getOverallRating(),
        attack: player.attack,
        defense: player.defense,
        intelligence: player.intelligence,
        mentality: player.mentality,
      },
    };
  }

  async getChampionshipChanges(
    championshipId: string,
  ): Promise<ChampionshipRatingChangesDto> {
    const championship =
      await this._championshipRepository.findChampionshipById(championshipId);
    if (championship === null) {
      throw new BadRequestException('Championship not found');
    }

    const all = await this._snapshots.findAll();
    const afterThisCup = all.filter((s) => s.championshipId === championshipId);
    const cupTime = championship.createdAt.toMillis();

    const changes: ChampionshipRatingChangesDto['changes'] = [];
    const firstRatings: ChampionshipRatingChangesDto['firstRatings'] = [];

    for (const after of afterThisCup) {
      // The player's latest rating from before this cup
      const before = all
        .filter(
          (s) =>
            s.playerId === after.playerId &&
            s.id !== after.id &&
            s.takenAt.toMillis() < cupTime,
        )
        .at(-1);

      if (!before) {
        firstRatings.push({
          playerId: after.playerId,
          playerName: after.playerName,
          after: toPoint(after),
        });
        continue;
      }

      changes.push({
        playerId: after.playerId,
        playerName: after.playerName,
        before: toPoint(before),
        after: toPoint(after),
        delta: after.overall - before.overall,
        rawDelta: rawDelta(before, after),
      });
    }

    changes.sort(
      (a, b) => b.delta - a.delta || a.playerName.localeCompare(b.playerName),
    );

    // What each player was rated as they entered the cup
    const participants =
      await this._championshipRepository.findParticipantsByChampionshipId(
        championshipId,
      );
    const enteringRatings = participants
      .filter((p) => !('player1' in p))
      .map((p) => {
        const before = all
          .filter((s) => s.playerId === p.id && s.takenAt.toMillis() < cupTime)
          .at(-1);
        return { playerId: p.id, rating: before ? toPoint(before) : null };
      });

    return {
      championshipId,
      saved: afterThisCup.length > 0,
      canSave: await this._isLatestCup(championshipId),
      changes,
      enteringRatings,
      firstRatings,
    };
  }

  /** Saves every participant's current ratings as their ratings after this cup. */
  async saveChampionshipRatings(
    championshipId: string,
  ): Promise<{ saved: number }> {
    const championship =
      await this._championshipRepository.findChampionshipById(championshipId);
    if (championship === null) {
      throw new BadRequestException('Championship not found');
    }
    if (!(await this._isLatestCup(championshipId))) {
      throw new BadRequestException(
        "Ratings can only be saved for the most recent cup, since they're today's ratings.",
      );
    }

    const participants =
      await this._championshipRepository.findParticipantsByChampionshipId(
        championshipId,
      );

    // Duo cups list duos; rate both players (once, for a solo duo)
    const players = new Map<string, PlayerEntity>();
    for (const participant of participants) {
      if ('player1' in participant) {
        const duo = participant as DuoEntity;
        players.set(duo.player1.id, duo.player1);
        players.set(duo.player2.id, duo.player2);
      } else {
        players.set(participant.id, participant);
      }
    }

    const ratings: SaveRatingSnapshotParams[] = [];
    for (const id of players.keys()) {
      // Read fresh from the player table so the snapshot matches the current ratings
      const player = await this._playerRepository.findById(id);
      if (player === null) continue;
      ratings.push({
        playerId: player.id,
        overall: player.getOverallRating(),
        attack: player.attack,
        defense: player.defense,
        intelligence: player.intelligence,
        mentality: player.mentality,
      });
    }

    await this._snapshots.saveForChampionship(
      championshipId,
      championship.createdAt,
      ratings,
    );
    return { saved: ratings.length };
  }

  private async _isLatestCup(championshipId: string): Promise<boolean> {
    const cups = await this._championshipRepository.listChampionships();
    const latest = [...cups].sort(
      (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
    )[0];
    return latest?.id === championshipId;
  }
}
