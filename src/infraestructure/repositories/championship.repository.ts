import { Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  CreateChampionshipParams,
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
      },
      select: {
        matches: true,
        players: true,
      },
    });
  }
}
