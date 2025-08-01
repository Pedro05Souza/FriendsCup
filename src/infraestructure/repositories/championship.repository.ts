import { Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  ChampionshipWinners,
  CreateChampionshipParams,
  CreateChampionshipParticipantParams,
  CreateDuoParams,
  CreateGroupEntityParams,
  CreateMatchParticipant,
} from '../../domain/interfaces/championship.interface';
import { mapToChampionshipEntity } from './mappers/championship.mapper';
import { ChampionshipEntity } from 'src/domain/entities/championship.entity';
import { playerModelToEntity } from './mappers/player.mapper';
import { PrismaClientService } from 'src/application/services/prisma-client';
import {
  DuoEntity,
  GroupDuoEntity,
  GroupPlayerEntity,
  PlayerEntity,
} from 'src/domain/entities/player.entity';
import { GroupEntity } from 'src/domain/entities/group.entity';
import {
  mapToGroupEntity,
  mapToGroupParticipant,
} from './mappers/group.mapper';
import { MatchEntity } from 'src/domain/entities/match.entity';
import { MatchPhase } from 'src/domain/constants';
import { mapToMatchEntity } from './mappers/match.mapper';

interface PlayerData {
  id: string;
  createdAt: Date;
  name: string;
  intelligence: number;
  defense: number;
  attack: number;
  mentality: number;
}

type DuoData = {
  player1: PlayerData;
  player2: PlayerData;
} & {
  id: string;
  championshipId: string;
  player1Id: string;
  player2Id: string;
  name: string;
};

export type GroupPlayerData = {
  player: PlayerData | null;
  duo: DuoData | null;
} & {
  id: string;
  playerId: string | null;
  duoId: string | null;
  championshipGroupId: string;
  points: number;
  goalDifference: number;
};

export type ChampionshipGroupData = {
  groupPlayers: GroupPlayerData[];
} & {
  id: string;
  createdAt: Date;
  championshipId: string;
};

export type MatchData = {
  participants: Array<{
    id: string;
    penaltyShootoutGoals: number | null;
    goals: number;
    playerId?: string | null;
    duoId?: string | null;
  }>;
} & {
  id: string;
  championshipId: string;
  matchPhase: string;
  winnerId: string | null;
  duoWinnerId: string | null;
};

export type ChampionshipData = {
  matches: Array<{
    id: string;
  }>;
  players: Array<{
    id: string;
  }>;
  duos: Array<{
    id: string;
  }>;
  groups: Array<{
    id: string;
  }>;
} & {
  id: string;
  title: string;
  createdAt: Date;
  isDuo: boolean;
  winnerId?: string | null;
  duoWinnerId?: string | null;
};

@Injectable()
export class ChampionshipRepositoryImpl implements ChampionshipRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async createChampionship(params: CreateChampionshipParams): Promise<void> {
    await this._prismaService.championship.create({
      data: {
        title: params.title,
        createdAt: params.createdAt.toJSDate(),
        isDuo: params.isDuo,
      },
    });
  }

  async updateChampionshipWinner(
    championshipId: string,
    winnerId?: string,
    duoWinnerId?: string,
  ): Promise<void> {
    await this._prismaService.championship.update({
      where: { id: championshipId },
      data: {
        winnerId,
        duoWinnerId,
      },
    });
  }

  async createDuo(params: CreateDuoParams): Promise<DuoEntity> {
    const duo = await this._prismaService.duo.create({
      data: {
        player1Id: params.player1Id,
        player2Id: params.player2Id,
        championshipId: params.championshipId,
        name: params.name,
      },
      include: {
        player1: true,
        player2: true,
      },
    });

    return {
      id: duo.id,
      player1: playerModelToEntity(duo.player1),
      player2: playerModelToEntity(duo.player2),
      name: duo.name,
    };
  }

  async findChampionshipById(id: string): Promise<ChampionshipEntity | null> {
    const championship = await this._prismaService.championship.findUnique({
      where: { id },
      include: {
        matches: {
          select: {
            id: true,
          },
        },
        players: {
          select: {
            id: true,
          },
        },
        duos: {
          select: {
            id: true,
          },
        },
        groups: {
          select: {
            id: true,
          },
        },
      },
    });

    if (championship === null) {
      return null;
    }

    return mapToChampionshipEntity(championship);
  }

  async createMatch(
    championshipId: string,
    matchPhase: MatchPhase,
    winnerId?: string,
    duoWinnerId?: string,
  ): Promise<MatchEntity> {
    const match = await this._prismaService.match.create({
      data: {
        championshipId,
        matchPhase,
        winnerId,
        duoWinnerId,
      },
      include: {
        participants: {
          select: {
            id: true,
            penaltyShootoutGoals: true,
            goals: true,
            playerId: true,
            duoId: true,
          },
        },
      },
    });

    return mapToMatchEntity(match);
  }

  async getDuoPlayersById(duoId: string): Promise<DuoEntity | null> {
    const duo = await this._prismaService.duo.findUnique({
      where: { id: duoId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (duo === null) {
      return null;
    }

    return {
      id: duo.id,
      player1: playerModelToEntity(duo.player1),
      player2: playerModelToEntity(duo.player2),
      name: duo.name,
    };
  }

  async getGroupById(groupId: string): Promise<GroupEntity | null> {
    const group = await this._prismaService.championshipGroup.findUnique({
      where: { id: groupId },
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    if (group === null) {
      return null;
    }

    return mapToGroupEntity(group);
  }

  async createChampionshipGroup(championshipId: string): Promise<GroupEntity> {
    const group = await this._prismaService.championshipGroup.create({
      data: {
        championshipId,
      },
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    return mapToGroupEntity(group);
  }

  async getGroupByParticipantId(
    participantId: string,
    championshipId?: string,
  ): Promise<GroupEntity | null> {
    const whereClause: {
      groupPlayers: {
        some: {
          OR: Array<{ playerId: string } | { duoId: string }>;
        };
      };
      championshipId?: string;
    } = {
      groupPlayers: {
        some: {
          OR: [{ playerId: participantId }, { duoId: participantId }],
        },
      },
    };

    if (championshipId) {
      whereClause.championshipId = championshipId;
    }

    const group = await this._prismaService.championshipGroup.findFirst({
      where: whereClause,
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    if (group === null) {
      return null;
    }

    return mapToGroupEntity(group);
  }

  async updateGroupParticipant(
    groupParticipant: GroupPlayerEntity | GroupDuoEntity,
  ): Promise<void> {
    await this._prismaService.groupPlayer.update({
      where: {
        id: groupParticipant.groupPlayerId,
      },
      data: {
        points: groupParticipant.points,
        goalDifference: groupParticipant.goalDifference,
      },
    });
  }

  async createGroupParticipant(
    params: CreateGroupEntityParams,
  ): Promise<GroupPlayerEntity | GroupDuoEntity> {
    const groupPlayer = await this._prismaService.groupPlayer.create({
      data: {
        points: params.points,
        goalDifference: params.goalDifference,
        championshipGroupId: params.championshipGroupId,
        playerId: params.playerId,
        duoId: params.duoId,
      },
      include: {
        player: true,
        duo: {
          include: {
            player1: true,
            player2: true,
          },
        },
      },
    });

    return mapToGroupParticipant(groupPlayer);
  }

  async createMatchParticipant(
    matchParticipant: CreateMatchParticipant,
  ): Promise<void> {
    await this._prismaService.matchParticipant.create({
      data: {
        matchId: matchParticipant.matchId,
        playerId: matchParticipant.playerId,
        duoId: matchParticipant.duoId,
        goals: matchParticipant.goals,
        penaltyShootoutGoals: matchParticipant.penaltyShootoutGoals,
      },
    });
  }

  async getMatchesByIds(matchIds: string[]): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        id: { in: matchIds },
      },
      include: {
        participants: {
          select: {
            id: true,
            penaltyShootoutGoals: true,
            goals: true,
            playerId: true,
            duoId: true,
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }

  async findParticipantsByChampionshipId(
    championshipId: string,
  ): Promise<Array<DuoEntity | PlayerEntity>> {
    const championship = await this._prismaService.championship.findUnique({
      where: { id: championshipId },
      include: {
        duos: {
          include: {
            player1: true,
            player2: true,
          },
        },
        players: true,
      },
    });

    if (championship === null) {
      return [];
    }

    if (championship.duos.length > 0) {
      return championship.duos.map((duo) => ({
        id: duo.id,
        player1: playerModelToEntity(duo.player1),
        player2: playerModelToEntity(duo.player2),
        name: duo.name,
      }));
    }

    if (championship.players.length > 0) {
      return championship.players.map((player) => playerModelToEntity(player));
    }

    return [];
  }

  async bulkCreateParticipantsForChampionship(
    params: CreateChampionshipParticipantParams,
  ): Promise<void> {
    await this._prismaService.championship.update({
      where: { id: params.championshipId },
      data: {
        ...(params.playerIds && {
          players: {
            connect: params.playerIds.map((id) => ({ id })),
          },
        }),
        ...(params.duoIds && {
          duos: {
            connect: params.duoIds.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async getGroupsByIds(groupIds: string[]): Promise<GroupEntity[]> {
    const groups = await this._prismaService.championshipGroup.findMany({
      where: {
        id: { in: groupIds },
      },
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    return groups.map(mapToGroupEntity);
  }

  async getMatchHistoryForPlayers(
    playerId: string,
    opponentId: string,
  ): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        AND: [
          {
            participants: {
              some: {
                OR: [{ playerId }, { duoId: playerId }],
              },
            },
          },
          {
            participants: {
              some: {
                OR: [{ playerId: opponentId }, { duoId: opponentId }],
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            penaltyShootoutGoals: true,
            goals: true,
            playerId: true,
            duoId: true,
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }

  async getChampionshipWinners(): Promise<ChampionshipWinners[]> {
    const championships = await this._prismaService.championship.findMany({
      where: {
        OR: [{ winnerId: { not: null } }, { duoWinnerId: { not: null } }],
      },
      include: {
        winner: true,
        duoWinner: {
          include: {
            player1: true,
            player2: true,
          },
        },
      },
    });

    const playerWinsMap = new Map<
      string,
      {
        playerName: string;
        championships: Map<string, number>;
      }
    >();

    championships.forEach((championship) => {
      if (championship.winner) {
        const playerId = championship.winner.id;
        if (!playerWinsMap.has(playerId)) {
          playerWinsMap.set(playerId, {
            playerName: championship.winner.name,
            championships: new Map(),
          });
        }

        const playerData = playerWinsMap.get(playerId)!;
        const currentCount =
          playerData.championships.get(championship.title) ?? 0;
        playerData.championships.set(championship.title, currentCount + 1);
      }

      if (championship.duoWinner) {
        const uniquePlayers =
          championship.duoWinner.player1.id ===
          championship.duoWinner.player2.id
            ? [championship.duoWinner.player1]
            : [championship.duoWinner.player1, championship.duoWinner.player2];

        uniquePlayers.forEach((player) => {
          const playerId = player.id;
          if (!playerWinsMap.has(playerId)) {
            playerWinsMap.set(playerId, {
              playerName: player.name,
              championships: new Map(),
            });
          }

          const playerData = playerWinsMap.get(playerId)!;
          const currentCount =
            playerData.championships.get(championship.title) ?? 0;
          playerData.championships.set(championship.title, currentCount + 1);
        });
      }
    });

    return Array.from(playerWinsMap.entries()).map(([playerId, data]) => ({
      playerId,
      playerName: data.playerName,
      championships: Array.from(data.championships.entries()).map(
        ([championshipName, timesWon]) => ({
          championshipName,
          timesWon,
        }),
      ),
    }));
  }
}
