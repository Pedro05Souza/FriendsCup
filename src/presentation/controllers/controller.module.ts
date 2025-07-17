import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { UsecasesModule } from 'src/application/usecases/usecases.module';
import { ChampionshipController } from './championship.controller';
import { MatchController } from './match.controller';

@Module({
  controllers: [PlayerController, ChampionshipController, MatchController],
  providers: [],
  exports: [],
  imports: [UsecasesModule],
})
export class ControllerModule {}
