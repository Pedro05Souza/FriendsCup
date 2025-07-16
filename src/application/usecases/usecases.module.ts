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
  ],
  exports: [
    CreatePlayerUsecase,
    DeletePlayerUsecase,
    UpdatePlayerUsecase,
    CreateChampionshipUsecase,
    ListPlayersUsecase,
    CreateDuoUsecase,
    CreateMatchUsecase,
  ],
  imports: [RepositoriesModule],
})
export class UsecasesModule {}
