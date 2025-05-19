import { Module } from '@nestjs/common';
import { PlayerDtoAssembler } from './assemblers/player-dto.assembler';
import { CreatePlayerUsecase } from './create-player.usecase';
import { RepositoriesModule } from 'src/infraestructure/repositories/repositories.module';
import { DeletePlayerUsecase } from './delete-player.usecase';

@Module({
  controllers: [],
  providers: [PlayerDtoAssembler, CreatePlayerUsecase, DeletePlayerUsecase],
  exports: [CreatePlayerUsecase, DeletePlayerUsecase],
  imports: [RepositoriesModule],
})
export class UsecasesModule {}
