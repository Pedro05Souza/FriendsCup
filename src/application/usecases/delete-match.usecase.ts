import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { DUO_CHAMPIOSHIPS } from 'src/domain/constants';
import { GroupStandingsService } from './group-standings.service';
import {
  findMatchInChampionship,
  storedMatchSides,
} from './update-match.usecase';

@Injectable()
export class DeleteMatchUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    private readonly _groupStandings: GroupStandingsService,
  ) {}

  async deleteMatch(championshipId: string, matchId: string): Promise<void> {
    const { championship, match } = await findMatchInChampionship(
      this._championshipRepository,
      championshipId,
      matchId,
    );

    const sides = storedMatchSides(match);
    if (match.matchPhase === 'GROUP_STAGE' && sides) {
      await this._groupStandings.removeResult(championshipId, ...sides);
    }

    await this._championshipRepository.deleteMatch(matchId);

    // Without its final, a cup has no champion
    if (match.matchPhase === 'FINALS') {
      await this._championshipRepository.setChampionshipWinner(
        championshipId,
        null,
        DUO_CHAMPIOSHIPS.includes(championship.title),
      );
    }
  }
}
