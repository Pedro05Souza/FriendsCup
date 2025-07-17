import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  championshipRepositoryToken,
  ChampionshipRepository,
} from 'src/domain/interfaces/championship.interface';
import { CreateDuoDto } from '../dtos/create-duo.dto';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';

@Injectable()
export class CreateDuoUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async createDuo(
    championshipId: string,
    createDuoDto: CreateDuoDto,
  ): Promise<void> {
    const championship =
      await this._championshipRepository.findChampionshipById(championshipId);

    if (championship === null) {
      throw new BadRequestException('Championship not found');
    }

    if (championship.isDuo === false) {
      throw new BadRequestException('Championship is not a duo type');
    }

    let name = createDuoDto.name;

    if (createDuoDto.name === undefined) {
      const player1 = await this._playerRepository.findById(
        createDuoDto.player1Id,
      );

      if (player1 === null) {
        throw new BadRequestException('Player 1 not found');
      }

      const player2 = await this._playerRepository.findById(
        createDuoDto.player2Id,
      );

      if (player2 === null) {
        throw new BadRequestException('Player 2 not found');
      }

      name = `${player1.name} & ${player2.name}`;
    }

    const participants =
      await this._championshipRepository.findParticipantsByChampionshipId(
        championshipId,
      );

    participants.forEach((participant) => {
      if ('player1' in participant && 'player2' in participant) {
        if (
          participant.player1.id === createDuoDto.player1Id ||
          participant.player2.id === createDuoDto.player2Id
        ) {
          throw new BadRequestException(
            'One of the players is already in a duo',
          );
        }
      }
    });

    const duoEntity = await this._championshipRepository.createDuo({
      player1Id: createDuoDto.player1Id,
      player2Id: createDuoDto.player2Id,
      championshipId: championship.id,
      name: name as string,
    });

    await this._championshipRepository.bulkCreateParticipantsForChampionship({
      championshipId: championship.id,
      duoIds: [duoEntity.id],
    });
  }
}
