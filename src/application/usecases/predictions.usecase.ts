import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import {
  DEFAULT_MODEL_OPTIONS,
  expectedGoals,
  fitPoissonModel,
  predictMatch,
  PoissonModel,
} from 'src/domain/prediction/poisson-model';
import {
  playCup,
  simulateCup,
  SimulatedMatch,
} from 'src/domain/prediction/cup-simulator';
import {
  CupSimulationDto,
  MatchPredictionDto,
  PlayCupDto,
  PlayedCupDto,
  PlayedMatchDto,
  PowerRatingsDto,
  SimulateCupDto,
} from '../dtos/prediction.dto';

const MATRIX_SIZE = 7; // scores 0..6 for each side

/**
 * Predictions from a Poisson model fitted on every 1v1 result: single-match
 * odds, power ratings, and Monte Carlo simulations of a whole cup.
 * Duo matches are left out, as on the head-to-head page.
 */
@Injectable()
export class PredictionsUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async predictMatch(
    playerId: string,
    opponentId: string,
  ): Promise<MatchPredictionDto> {
    if (playerId === opponentId) {
      throw new BadRequestException('Pick two different players');
    }
    const names = await this._names([playerId, opponentId]);
    const { model } = await this._model();
    const p = predictMatch(model, playerId, opponentId, MATRIX_SIZE - 1);

    const likelyScores = p.scoreMatrix
      .flatMap((row, i) =>
        row.map((probability, j) => ({ player: i, opponent: j, probability })),
      )
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    return {
      player: {
        playerId,
        playerName: names.get(playerId)!,
        matchesInModel: model.matches.get(playerId) ?? 0,
        expectedGoals: p.expectedGoalsA,
        winProbability: p.winA,
      },
      opponent: {
        playerId: opponentId,
        playerName: names.get(opponentId)!,
        matchesInModel: model.matches.get(opponentId) ?? 0,
        expectedGoals: p.expectedGoalsB,
        winProbability: p.winB,
      },
      drawProbability: p.draw,
      likelyScores,
      scoreMatrix: p.scoreMatrix,
    };
  }

  async powerRatings(): Promise<PowerRatingsDto> {
    const { model, matchesUsed } = await this._model();
    const players = await this._playerRepository.findAll();
    const average = '\u0000league-average';

    const ratings = players
      .map((player) => {
        const xg = expectedGoals(model, player.id, average);
        return {
          playerId: player.id,
          playerName: player.name,
          matchesInModel: model.matches.get(player.id) ?? 0,
          attack: xg.a,
          defence: xg.b,
          strength: xg.a - xg.b,
        };
      })
      .sort((a, b) => b.strength - a.strength);

    return {
      matchesUsed,
      halfLifeYears: DEFAULT_MODEL_OPTIONS.halfLifeYears,
      ratings,
    };
  }

  async simulateCup(request: SimulateCupDto): Promise<CupSimulationDto> {
    const names = await this._names(request.playerIds);
    const { model } = await this._model();
    const seed = request.seed ?? Math.floor(Math.random() * 2 ** 31);
    const simulations = request.simulations ?? 10000;

    const odds = simulateCup(
      model,
      request.playerIds,
      request.format,
      simulations,
      seed,
    );

    return {
      format: request.format,
      simulations,
      seed,
      odds: odds.map((o) => ({
        ...o,
        playerName: names.get(o.playerId)!,
        matchesInModel: model.matches.get(o.playerId) ?? 0,
      })),
    };
  }

  /** Plays one whole cup, every match, from a seed that can be shared. */
  async playCup(request: PlayCupDto): Promise<PlayedCupDto> {
    const names = await this._names(request.playerIds);
    const { model } = await this._model();
    // Short numbers, so a cup is easy to tell a friend about
    const seed = request.seed ?? 1 + Math.floor(Math.random() * 99999);
    const cup = playCup(model, request.playerIds, request.format, seed);
    const name = (id: string): string => names.get(id)!;

    let counter = 0;
    const toMatch = (m: SimulatedMatch): PlayedMatchDto => ({
      id: `sim-${++counter}`,
      matchPhase: m.phase,
      participants: [
        { id: m.home, name: name(m.home), goals: m.homeGoals },
        { id: m.away, name: name(m.away), goals: m.awayGoals },
      ].map((p, i) =>
        m.shootout ? { ...p, penaltyShootoutGoals: m.shootout[i]! } : p,
      ),
      winnerId: m.winnerId,
      winnerName: m.winnerId ? name(m.winnerId) : null,
    });

    return {
      format: request.format,
      seed,
      championId: cup.championId,
      championName: name(cup.championId),
      runnerUpId: cup.runnerUpId,
      runnerUpName: cup.runnerUpId ? name(cup.runnerUpId) : null,
      groups: cup.groups.map((g) => ({
        name: g.name,
        table: g.table.map((r) => ({ ...r, playerName: name(r.playerId) })),
        matches: g.matches.map(toMatch),
      })),
      knockout: cup.knockout.map(toMatch),
    };
  }

  private async _model(): Promise<{
    model: PoissonModel;
    matchesUsed: number;
  }> {
    const results = await this._championshipRepository.getOneVsOneResults();
    return { model: fitPoissonModel(results), matchesUsed: results.length };
  }

  private async _names(ids: string[]): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    for (const id of ids) {
      const player = await this._playerRepository.findById(id);
      if (player === null) {
        throw new BadRequestException(`Player with ID ${id} does not exist.`);
      }
      names.set(id, player.name);
    }
    return names;
  }
}
