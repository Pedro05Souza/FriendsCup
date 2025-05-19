import { Module } from '@nestjs/common';
import { PlayerRepositoryImpl } from './player.repository';
import { ServicesModule } from 'src/application/services/services.module';
import { playerRepositoryToken } from '../../domain/interfaces/player.interface';
import { championshipRepositoryToken } from '../../domain/interfaces/championship.interface';
import { ChampionshipRepositoryImpl } from './championship.repository';

@Module({
  imports: [ServicesModule],
  controllers: [],
  providers: [
    {
      provide: playerRepositoryToken,
      useClass: PlayerRepositoryImpl,
    },
    {
      provide: championshipRepositoryToken,
      useClass: ChampionshipRepositoryImpl,
    }
  ],
  exports: [playerRepositoryToken],
})
export class RepositoriesModule {}
