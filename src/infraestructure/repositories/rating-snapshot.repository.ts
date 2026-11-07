import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaClientService } from 'src/application/services/prisma-client';
import type {
  RatingScale,
  RatingSnapshotEntity,
  RatingSnapshotRepository,
  SaveRatingSnapshotParams,
} from 'src/domain/interfaces/rating-snapshot.interface';

const include = {
  player: { select: { name: true } },
  championship: { select: { title: true } },
} as const;

interface SnapshotRow {
  id: string;
  playerId: string;
  championshipId: string | null;
  takenAt: Date;
  scale: string;
  rawOverall: number;
  overall: number;
  attack: number | null;
  defense: number | null;
  intelligence: number | null;
  mentality: number | null;
  player: { name: string };
  championship: { title: string } | null;
}

function toEntity(row: SnapshotRow): RatingSnapshotEntity {
  return {
    id: row.id,
    playerId: row.playerId,
    playerName: row.player.name,
    championshipId: row.championshipId,
    championshipTitle: row.championship?.title ?? null,
    takenAt: DateTime.fromJSDate(row.takenAt),
    scale: row.scale as RatingScale,
    rawOverall: row.rawOverall,
    overall: row.overall,
    attack: row.attack,
    defense: row.defense,
    intelligence: row.intelligence,
    mentality: row.mentality,
  };
}

@Injectable()
export class RatingSnapshotRepositoryImpl implements RatingSnapshotRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async findAll(): Promise<RatingSnapshotEntity[]> {
    const rows = await this._prismaService.playerRatingSnapshot.findMany({
      include,
      orderBy: { takenAt: 'asc' },
    });
    return rows.map(toEntity);
  }

  async findByPlayer(playerId: string): Promise<RatingSnapshotEntity[]> {
    const rows = await this._prismaService.playerRatingSnapshot.findMany({
      where: { playerId },
      include,
      orderBy: { takenAt: 'asc' },
    });
    return rows.map(toEntity);
  }

  async saveForChampionship(
    championshipId: string,
    takenAt: DateTime,
    ratings: SaveRatingSnapshotParams[],
  ): Promise<void> {
    await this._prismaService.$transaction(
      ratings.map((rating) => {
        const values = {
          takenAt: takenAt.toJSDate(),
          scale: 'POINTS_100',
          rawOverall: rating.overall,
          overall: rating.overall,
          attack: rating.attack,
          defense: rating.defense,
          intelligence: rating.intelligence,
          mentality: rating.mentality,
        };
        return this._prismaService.playerRatingSnapshot.upsert({
          where: {
            playerId_championshipId: {
              playerId: rating.playerId,
              championshipId,
            },
          },
          create: { ...values, playerId: rating.playerId, championshipId },
          update: values,
        });
      }),
    );
  }
}
