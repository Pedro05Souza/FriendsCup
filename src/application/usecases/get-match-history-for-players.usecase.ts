import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { MatchHistoryDto } from '../dtos/get-match-history.dto';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { MatchEntity } from 'src/domain/entities/match.entity';

@Injectable()
export class GetMatchHistoryForPlayersUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async getMatchHistoryForPlayers(
    playerId: string,
    opponentId: string,
  ): Promise<MatchHistoryDto> {
    await this.validatePlayersExist(playerId, opponentId);

    const matches = await this.getMatches(playerId, opponentId);

    this.validateMatchesExist(matches, playerId, opponentId);

    const matchStats = this.calculateMatchStats(matches, playerId, opponentId);
    const goalStats = this.calculateGoalStats(matches, playerId, opponentId);

    return {
      ...matchStats,
      ...goalStats,
    };
  }

  private async validatePlayersExist(
    playerId: string,
    opponentId: string,
  ): Promise<void> {
    const player = await this._playerRepository.findById(playerId);
    if (player === null) {
      throw new BadRequestException(
        `Player with ID ${playerId} does not exist.`,
      );
    }

    const opponent = await this._playerRepository.findById(opponentId);
    if (opponent === null) {
      throw new BadRequestException(
        `Opponent with ID ${opponentId} does not exist.`,
      );
    }
  }

  private async getMatches(
    playerId: string,
    opponentId: string,
  ): Promise<MatchEntity[]> {
    return this._championshipRepository.getMatchHistoryForPlayers(
      playerId,
      opponentId,
    );
  }

  private validateMatchesExist(
    matches: MatchEntity[],
    playerId: string,
    opponentId: string,
  ): void {
    if (matches.length === 0) {
      throw new BadRequestException(
        `No match history found for players ${playerId} and ${opponentId}.`,
      );
    }
  }

  private calculateMatchStats(
    matches: MatchEntity[],
    playerId: string,
    opponentId: string,
  ): {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    matchesDrawn: number;
    winRate: number;
  } {
    const matchesPlayed = matches.length;
    const matchesWon = matches.filter(
      (match) => match.winnerId === playerId,
    ).length;
    const matchesLost = matches.filter(
      (match) => match.winnerId === opponentId,
    ).length;
    const matchesDrawn = matches.filter(
      (match) => match.winnerId === null,
    ).length;
    const winRate = matchesPlayed
      ? Math.round((matchesWon / matchesPlayed) * 100)
      : 0;

    return {
      matchesPlayed,
      matchesWon,
      matchesLost,
      matchesDrawn,
      winRate,
    };
  }

  private calculateGoalStats(
    matches: MatchEntity[],
    playerId: string,
    opponentId: string,
  ): {
    biggestLossDifference: number;
    biggestWinDifference: number;
    goalsScored: number;
    goalsConceded: number;
  } {
    const biggestLossDifference = this.calculateBiggestLossDifference(
      matches,
      playerId,
      opponentId,
    );
    const biggestWinDifference = this.calculateBiggestWinDifference(
      matches,
      playerId,
      opponentId,
    );
    const goalsScored = this.calculateGoalsScored(matches, playerId);
    const goalsConceded = this.calculateGoalsConceded(matches, opponentId);

    return {
      biggestLossDifference,
      biggestWinDifference,
      goalsScored,
      goalsConceded,
    };
  }

  private getPlayerGoals(match: MatchEntity, playerId: string): number {
    const playerGoals = match.participantGoals.find(
      (goal) => goal.playerId === playerId,
    );
    return playerGoals ? playerGoals.goals : 0;
  }

  private calculateBiggestLossDifference(
    matches: MatchEntity[],
    playerId: string,
    opponentId: string,
  ): number {
    return matches.reduce((max, match) => {
      const playerGoalsCount = this.getPlayerGoals(match, playerId);
      const opponentGoalsCount = this.getPlayerGoals(match, opponentId);
      const goalDifference = opponentGoalsCount - playerGoalsCount;
      return goalDifference > 0 ? Math.max(max, goalDifference) : max;
    }, 0);
  }

  private calculateBiggestWinDifference(
    matches: MatchEntity[],
    playerId: string,
    opponentId: string,
  ): number {
    return matches.reduce((max, match) => {
      const playerGoalsCount = this.getPlayerGoals(match, playerId);
      const opponentGoalsCount = this.getPlayerGoals(match, opponentId);
      const goalDifference = playerGoalsCount - opponentGoalsCount;
      return goalDifference > 0 ? Math.max(max, goalDifference) : max;
    }, 0);
  }

  private calculateGoalsScored(
    matches: MatchEntity[],
    playerId: string,
  ): number {
    return matches.reduce((acc, match) => {
      return acc + this.getPlayerGoals(match, playerId);
    }, 0);
  }

  private calculateGoalsConceded(
    matches: MatchEntity[],
    opponentId: string,
  ): number {
    return matches.reduce((acc, match) => {
      return acc + this.getPlayerGoals(match, opponentId);
    }, 0);
  }
}
