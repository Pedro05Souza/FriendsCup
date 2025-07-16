import { Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  CreateChampionshipParams,
  CreateDuoParams,
  CreateGroupEntityParams,
  CreateMatchParams,
} from '../../domain/interfaces/championship.interface';
import { mapToRawChampionshipEntity } from './mappers/championship.mapper';
import { RawChampionshipEntity } from 'src/domain/entities/championship.entity';
import { playerModelToEntity } from './mappers/player.mapper';
import { PrismaClientService } from 'src/application/services/prisma-client';
import {
  DuoEntity,
  GroupDuoEntity,
  GroupPlayerEntity,
} from 'src/domain/entities/player.entity';
import { GroupEntity } from 'src/domain/entities/group.entity';
import {
  mapToGroupEntity,
  mapToGroupParticipant,
} from './mappers/group.mapper';

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

@Injectable()
export class ChampionshipRepositoryImpl implements ChampionshipRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async create(params: CreateChampionshipParams): Promise<void> {
    await this._prismaService.championship.create({
      data: {
        title: params.title,
        createdAt: params.createdAt.toJSDate(),
        isDuo: params.isDuo,
      },
      select: {
        matches: true,
        players: true,
      },
    });
  }

  async createDuo(params: CreateDuoParams): Promise<void> {
    await this._prismaService.duo.create({
      data: {
        player1Id: params.player1Id,
        player2Id: params.player2Id,
        championshipId: params.championshipId,
      },
    });
  }

  async findById(id: string): Promise<RawChampionshipEntity | null> {
    const championship = await this._prismaService.championship.findUnique({
      where: { id },
    });

    if (championship === null) {
      return null;
    }

    return mapToRawChampionshipEntity(championship);
  }

  async createMatch(params: CreateMatchParams): Promise<void> {
    const matchData = {
      championship: { connect: { id: params.championshipId } },
      matchPhase: params.matchPhase,
      score: {
        create: {
          score: params.playerGoals,
          penaltyScore: params.isPenaltyShootout
            ? (params.penaltyShootoutScore ?? null)
            : null,
        },
      },
      ...(params.playerId && { player: { connect: { id: params.playerId } } }),
      ...(params.duoId && { duo: { connect: { id: params.duoId } } }),
    };

    await this._prismaService.match.create({
      data: matchData,
    });
  }

  async getDuoPlayersById(duoId: string): Promise<DuoEntity | null> {
    const duo = await this._prismaService.duo.findUnique({
      where: { id: duoId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (!duo) {
      return null;
    }

    return {
      id: duo.id,
      player1: playerModelToEntity(duo.player1),
      player2: playerModelToEntity(duo.player2),
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

  async getGroupByPlayerId(playerId: string): Promise<GroupEntity | null> {
    const group = await this._prismaService.championshipGroup.findFirst({
      where: {
        groupPlayers: {
          some: {
            playerId,
          },
        },
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

    if (group === null) {
      return null;
    }

    return mapToGroupEntity(group);
  }

  async getGroupByDuoId(duoId: string): Promise<GroupEntity | null> {
    const group = await this._prismaService.championshipGroup.findFirst({
      where: {
        groupPlayers: {
          some: {
            duoId,
          },
        },
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
}
