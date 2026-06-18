import { Injectable } from '@nestjs/common';
import {
  NewPlayerEntity,
  PlayerEntity,
} from 'src/domain/entities/player.entity';
import { PrismaClientService } from 'src/application/services/prisma-client';
import { playerModelToEntity } from './mappers/player.mapper';
import {
  ListPlayerResponse,
  PlayerRankingData,
  PlayerRepository,
} from '../../domain/interfaces/player.interface';

@Injectable()
export class PlayerRepositoryImpl implements PlayerRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async create(newPlayer: NewPlayerEntity): Promise<PlayerEntity> {
    const newPlayerDb = await this._prismaService.player.create({
      data: {
        name: newPlayer.name,
        defense: newPlayer.defense,
        attack: newPlayer.attack,
        mentality: newPlayer.mentality,
        intelligence: newPlayer.intelligence,
      },
    });

    return playerModelToEntity(newPlayerDb);
  }

  async update(player: PlayerEntity): Promise<void> {
    await this._prismaService.player.update({
      where: { id: player.id },
      data: player,
    });
  }
  async findById(id: string): Promise<PlayerEntity | null> {
    const playerDb = await this._prismaService.player.findUnique({
      where: { id },
    });

    return playerDb ? playerModelToEntity(playerDb) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this._prismaService.player.delete({
      where: { id },
    });
  }

  async listPlayers(
    page: number,
    limit: number,
    name?: string,
  ): Promise<ListPlayerResponse> {
    const playersDb = await this._prismaService.player.findMany({
      skip: (page - 1) * limit,
      take: limit + 1,
      where: name
        ? { name: { contains: name, mode: 'insensitive' } }
        : undefined,
    });

    const strippedPlayers = playersDb.slice(0, limit);
    const hasMore = playersDb.length > limit;

    return {
      players: strippedPlayers.map(playerModelToEntity),
      hasMore,
    };
  }

  async findAll(): Promise<PlayerEntity[]> {
    const players = await this._prismaService.player.findMany({
      orderBy: { name: 'asc' },
    });
    return players.map(playerModelToEntity);
  }

  async getPlayerRankings(): Promise<PlayerRankingData[]> {
    const [players, participants, soloChampWins, duoChampWins] =
      await Promise.all([
        this._prismaService.player.findMany(),
        this._prismaService.matchParticipant.findMany({
          where: { playerId: { not: null } },
          select: {
            playerId: true,
            goals: true,
            match: { select: { winnerId: true, duoWinnerId: true } },
          },
        }),
        this._prismaService.championship.findMany({
          where: { winnerId: { not: null } },
          select: { winnerId: true, title: true },
        }),
        this._prismaService.championship.findMany({
          where: { duoWinnerId: { not: null } },
          select: {
            title: true,
            duoWinner: { select: { player1Id: true, player2Id: true } },
          },
        }),
      ]);

    const statsMap = new Map<string, PlayerRankingData>();

    players.forEach((p) => {
      const overallRating = Math.round(
        (p.attack + p.defense + p.intelligence + p.mentality) / 4,
      );
      statsMap.set(p.id, {
        playerId: p.id,
        playerName: p.name,
        overallRating,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsScored: 0,
        titlesWon: 0,
        titlesByChampionship: {},
      });
    });

    participants.forEach((p) => {
      if (!p.playerId) return;
      const stats = statsMap.get(p.playerId);
      if (!stats) return;
      stats.matchesPlayed++;
      stats.goalsScored += p.goals;
      if (!p.match.winnerId && !p.match.duoWinnerId) {
        stats.draws++;
      } else if (p.match.winnerId === p.playerId) {
        stats.wins++;
      } else {
        stats.losses++;
      }
    });

    soloChampWins.forEach((c) => {
      if (!c.winnerId) return;
      const stats = statsMap.get(c.winnerId);
      if (stats) {
        stats.titlesWon++;
        stats.titlesByChampionship[c.title] =
          (stats.titlesByChampionship[c.title] ?? 0) + 1;
      }
    });

    // Credit both players of the winning duo (dedup when player played with themselves)
    duoChampWins.forEach((c) => {
      if (!c.duoWinner) return;
      const playerIds = [c.duoWinner.player1Id, c.duoWinner.player2Id].filter(
        (id, idx, arr) => arr.indexOf(id) === idx,
      );
      playerIds.forEach((playerId) => {
        const stats = statsMap.get(playerId);
        if (stats) {
          stats.titlesWon++;
          stats.titlesByChampionship[c.title] =
            (stats.titlesByChampionship[c.title] ?? 0) + 1;
        }
      });
    });

    return Array.from(statsMap.values());
  }
}
