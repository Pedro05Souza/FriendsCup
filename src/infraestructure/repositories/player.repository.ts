import { Injectable } from '@nestjs/common';
import {
  NewPlayerEntity,
  PlayerEntity,
} from 'src/domain/entities/player.entity';
import { PrismaClientService } from 'src/application/services/prisma-client';
import { playerModelToEntity } from './mappers/player.mapper';
import {
  ListPlayerResponse,
  PlayerRepository,
} from '../../domain/interfaces/player.interface';

@Injectable()
export class PlayerRepositoryImpl implements PlayerRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async create(newPlayer: NewPlayerEntity): Promise<PlayerEntity> {
    const newPlayerDb = await this._prismaService.prisma.player.create({
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
    await this._prismaService.prisma.player.update({
      where: { id: player.id },
      data: player,
    });
  }
  async findById(id: string): Promise<PlayerEntity | null> {
    const playerDb = await this._prismaService.prisma.player.findUnique({
      where: { id },
    });

    return playerDb ? playerModelToEntity(playerDb) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this._prismaService.prisma.player.delete({
      where: { id },
    });
  }

  async listPlayers(page: number, limit: number): Promise<ListPlayerResponse> {
    const playersDb = await this._prismaService.prisma.player.findMany({
      skip: (page - 1) * limit,
      take: limit + 1,
    });

    const strippedPlayers = playersDb.slice(0, limit);
    const hasMore = playersDb.length > limit;

    return {
      players: strippedPlayers.map(playerModelToEntity),
      hasMore,
    };
  }
}
