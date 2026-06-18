import { Inject, Injectable } from '@nestjs/common';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { PlayerRankingDto } from '../dtos/player-ranking.dto';

const MIN_MATCHES_FOR_RANKING = 1;

// Prestige weight per cup title
const CUP_WEIGHTS: Record<string, number> = {
  'COPA NABOR': 10,    // Mundial
  'COPA CHILELA': 7,   // Libertadores / Champions
  'COPA DOUGLAS': 7,   // Mundial de Duplas
  'COPA DEIVES': 4,    // Estadual
  'COPA POLAR': 3,     // Estadual de Duplas
};

function titleScore(titlesByChampionship: Record<string, number>): number {
  return Object.entries(titlesByChampionship).reduce((sum, [cup, count]) => {
    return sum + (CUP_WEIGHTS[cup] ?? 5) * count;
  }, 0);
}

function computeScore(
  winRate: number,
  titles: Record<string, number>,
  avgGoals: number,
): number {
  return Number((winRate * 0.5 + titleScore(titles) + avgGoals * 5).toFixed(2));
}

@Injectable()
export class GetPlayerRankingsUsecase {
  constructor(
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async getPlayerRankings(): Promise<PlayerRankingDto[]> {
    const raw = await this._playerRepository.getPlayerRankings();

    return raw
      .filter((p) => p.matchesPlayed >= MIN_MATCHES_FOR_RANKING)
      .map((p) => {
        const winRate =
          p.matchesPlayed > 0
            ? Number(((p.wins / p.matchesPlayed) * 100).toFixed(2))
            : 0;
        const avgGoalsPerMatch =
          p.matchesPlayed > 0
            ? Number((p.goalsScored / p.matchesPlayed).toFixed(2))
            : 0;
        return {
          rank: 0,
          playerId: p.playerId,
          playerName: p.playerName,
          overallRating: p.overallRating,
          matchesPlayed: p.matchesPlayed,
          wins: p.wins,
          losses: p.losses,
          draws: p.draws,
          winRate,
          goalsScored: p.goalsScored,
          avgGoalsPerMatch,
          titlesWon: p.titlesWon,
          titlesByChampionship: p.titlesByChampionship,
          rankingScore: computeScore(winRate, p.titlesByChampionship, avgGoalsPerMatch),
        };
      })
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }
}
