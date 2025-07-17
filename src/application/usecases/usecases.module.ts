import { Module } from '@nestjs/common';
import { PlayerDtoAssembler } from './assemblers/player-dto.assembler';
import { CreatePlayerUsecase } from './create-player.usecase';
import { RepositoriesModule } from 'src/infraestructure/repositories/repositories.module';
import { DeletePlayerUsecase } from './delete-player.usecase';
import { UpdatePlayerUsecase } from './update-player.usecase';
import { CreateChampionshipUsecase } from './create-championship.usecase';
import { ListPlayersUsecase } from './list-players.usecase';
import { CreateDuoUsecase } from './create-duo.usecase';
import { CreateMatchUsecase } from './create-match.usecase';
import { ChampionshipDtoAssembler } from './assemblers/championship-dto.assembler';
import { GetChampionshipUsecase } from './get-championship.usecase';
import { GetMatchHistoryForPlayersUsecase } from './get-match-history-for-players.usecase';

@Module({
  controllers: [],
  providers: [
    PlayerDtoAssembler,
    CreatePlayerUsecase,
    DeletePlayerUsecase,
    UpdatePlayerUsecase,
    CreateChampionshipUsecase,
    ListPlayersUsecase,
    CreateDuoUsecase,
    CreateMatchUsecase,
    PlayerDtoAssembler,
    ChampionshipDtoAssembler,
    GetChampionshipUsecase,
    GetMatchHistoryForPlayersUsecase,
  ],
  exports: [
    CreatePlayerUsecase,
    DeletePlayerUsecase,
    UpdatePlayerUsecase,
    CreateChampionshipUsecase,
    ListPlayersUsecase,
    CreateDuoUsecase,
    CreateMatchUsecase,
    GetChampionshipUsecase,
    GetMatchHistoryForPlayersUsecase,
  ],
  imports: [RepositoriesModule],
})
export class UsecasesModule {}
