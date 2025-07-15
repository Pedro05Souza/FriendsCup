import { Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  CreateChampionshipParams,
  CreateDuoParams,
} from '../../domain/interfaces/championship.interface';
import { PrismaClientService } from 'src/application/services/prisma-client';

@Injectable()
export class ChampionshipRepositoryImpl implements ChampionshipRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async create(params: CreateChampionshipParams): Promise<void> {
    await this._prismaService.prisma.championship.create({
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
    await this._prismaService.prisma.duo.create({
      data: {
        player1Id: params.player1Id,
        player2Id: params.player2Id,
        championshipId: params.championshipId,
      },
    });
  }
}
