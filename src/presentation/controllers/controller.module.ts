import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { UsecasesModule } from 'src/application/usecases/usecases.module';
import { ChampionshipController } from './championship.controller';

@Module({
  controllers: [PlayerController, ChampionshipController],
  providers: [],
  exports: [],
  imports: [UsecasesModule],
})
export class ControllerModule {}
