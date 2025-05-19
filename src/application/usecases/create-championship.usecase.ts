// import { Inject, Injectable } from '@nestjs/common';
// import { CreatePlayerDto } from 'src/dtos/create-player.dto';
// import { PlayerDto } from 'src/dtos/player.dto';
// import { ChampionshipRepository, championshipRepositoryToken } from 'src/repositories/championship.interface';

// @Injectable()
// export class CreateChampionshipUsecase {
//   constructor(
//     @Inject(championshipRepositoryToken)
//     private readonly _championshipRepository: ChampionshipRepository,
//   ) {}

//   async createPlayer(playerDto: CreatePlayerDto): Promise<PlayerDto> {
//     const newPlayer = await this._playerRepository.create({
//       name: playerDto.name,
//       goalPerGame: 0,
//     });

//     return this._playerDtoAssembler.toDto(newPlayer);
//   }
// }
// descomenta isso dps