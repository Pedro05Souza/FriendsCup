import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MatchPhase } from 'src/domain/constants';
import {
  championshipRepositoryToken,
  ChampionshipRepository,
} from 'src/domain/interfaces/championship.interface';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';

export interface RetrospectData {
  totalGoals: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  averageGoalsPerMatch: number;
  furthestStageReached: MatchPhase;
}

export const MatchPhaseWeight: Record<MatchPhase, number> = {
  GROUP_STAGE: 1,

  ROUND_OF_16: 2,

  QUARTER_FINALS: 3,
  UPPER_BRACKET_QUARTER_FINALS: 3,
  LOWER_BRACKET_QUARTER_FINALS: 3,

  SEMIFINALS: 4,
  UPPER_BRACKET_SEMIFINALS: 4,
  LOWER_BRACKET_SEMIFINALS: 4,

  LOWER_BRACKET_FINALS: 5,
  THIRD_PLACE: 5,

  UPPER_BRACKET_FINALS: 6,

  FINALS: 7,
};

@Injectable()
export class RetrospectUsecase {
  constructor(
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getRetrospectForPlayer(playerId: string): Promise<RetrospectData> {
    const playerEntity = await this._playerRepository.findById(playerId);

    if (!playerEntity) {
      throw new BadRequestException(`Player with ID ${playerId} not found.`);
    }

    const matchesWon =
      await this._championshipRepository.getAllMatchesWonByPlayerId(playerId);

    const matchesLost =
      await this._championshipRepository.getAllMatchesLostByPlayerId(playerId);

    const matchesDrawn =
      await this._championshipRepository.getAllMatchesDrawnByPlayerId(playerId);

    const allMatches = [...matchesWon, ...matchesLost, ...matchesDrawn];

    const totalGoals = allMatches.reduce((sum, match) => {
      const goalsInMatch = match.participantGoals.reduce(
        (acc, pg) => acc + pg.goals,
        0,
      );
      return sum + goalsInMatch;
    }, 0);

    const totalMatches = allMatches.length;
    const totalWins = matchesWon.length;
    const totalLosses = matchesLost.length;
    const totalDraws = matchesDrawn.length;

    const winRate =
      totalMatches > 0
        ? Number(((totalWins / totalMatches) * 100).toFixed(2))
        : 0;

    const averageGoalsPerMatch =
      totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(2)) : 0;

    const furthestStageReached =
      allMatches.reduce<MatchPhase | null>((furthest, match) => {
        if (!furthest) return match.matchPhase;

        return MatchPhaseWeight[match.matchPhase] > MatchPhaseWeight[furthest]
          ? match.matchPhase
          : furthest;
      }, null) ?? 'GROUP_STAGE';
    return {
      totalGoals,
      totalMatches,
      totalWins,
      totalLosses,
      totalDraws,
      winRate,
      averageGoalsPerMatch,
      furthestStageReached,
    };
  }
}
