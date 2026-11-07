import { Module } from '@nestjs/common';
import { PlayerRepositoryImpl } from './player.repository';
import { ServicesModule } from 'src/application/services/services.module';
import { playerRepositoryToken } from '../../domain/interfaces/player.interface';
import { championshipRepositoryToken } from '../../domain/interfaces/championship.interface';
import { ChampionshipRepositoryImpl } from './championship.repository';
import { ratingSnapshotRepositoryToken } from '../../domain/interfaces/rating-snapshot.interface';
import { RatingSnapshotRepositoryImpl } from './rating-snapshot.repository';

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
    },
    {
      provide: ratingSnapshotRepositoryToken,
      useClass: RatingSnapshotRepositoryImpl,
    },
  ],
  exports: [
    playerRepositoryToken,
    championshipRepositoryToken,
    ratingSnapshotRepositoryToken,
  ],
})
export class RepositoriesModule {}
