import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
  PlayerSummaryChampionshipData,
  PlayerSummaryMatchData,
} from 'src/domain/interfaces/championship.interface';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { MatchPhase } from 'src/domain/constants';
import {
  CupFinish,
  PlayerSummaryCupDto,
  PlayerSummaryDto,
  PlayerSummaryOpponentDto,
} from '../dtos/player-summary.dto';

/** How deep into a cup each phase is, for "furthest stage reached". */
const PHASE_DEPTH: Record<MatchPhase, number> = {
  GROUP_STAGE: 0,
  'PLAY-INS': 1,
  ROUND_1_LOWER: 2,
  ROUND_OF_16: 2,
  ROUND_2_LOWER: 3,
  QUARTER_FINALS: 3,
  UPPER_BRACKET_QUARTER_FINALS: 3,
  ROUND_3_LOWER: 3,
  SEMIFINALS: 4,
  UPPER_BRACKET_SEMIFINALS: 4,
  LOWER_BRACKET_FINALS: 4,
  UPPER_BRACKET_FINALS: 5,
  THIRD_PLACE: 5,
  FINALS: 6,
};

/**
 * Everything the player page needs in one response: their cup-by-cup history,
 * finals record and golden boots, and their 1v1 record against every opponent.
 */
@Injectable()
export class GetPlayerSummaryUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async getPlayerSummary(playerId: string): Promise<PlayerSummaryDto> {
    const player = await this._playerRepository.findById(playerId);
    if (player === null) {
      throw new BadRequestException(
        `Player with ID ${playerId} does not exist.`,
      );
    }

    const championships =
      await this._championshipRepository.getPlayerSummaryData(playerId);

    const cups = championships.map((championship) =>
      this._cupRun(championship, playerId),
    );
    const bestFinish =
      [...cups].sort((a, b) => a.finishRank - b.finishRank)[0] ?? null;

    return {
      playerId: player.id,
      playerName: player.name,
      cupsEntered: cups.length,
      finalsPlayed: cups.filter((cup) => cup.playedFinal).length,
      finalsWon: cups.filter((cup) => cup.wonFinal).length,
      goldenBoots: cups.filter((cup) => cup.goldenBoot).length,
      bestFinish,
      cups,
      opponents: this._opponents(championships, playerId),
    };
  }

  private _cupRun(
    championship: PlayerSummaryChampionshipData,
    playerId: string,
  ): PlayerSummaryCupDto {
    // The sides this player played as in this cup: themselves, or their duo
    const mySideIds = new Set<string>();
    const myMatches = championship.matches.filter((match) =>
      match.participants.some((participant) => {
        const mine = participant.memberIds.includes(playerId);
        if (mine) mySideIds.add(participant.id);
        return mine;
      }),
    );

    const goals = myMatches.reduce((total, match) => {
      const mine = match.participants.find((p) => mySideIds.has(p.id));
      return total + (mine?.goals ?? 0);
    }, 0);

    const final = myMatches.find((match) => match.matchPhase === 'FINALS');
    const thirdPlace = myMatches.find(
      (match) => match.matchPhase === 'THIRD_PLACE',
    );
    const isChampion =
      championship.winnerId !== null && mySideIds.has(championship.winnerId);

    let finish: CupFinish;
    let phase: MatchPhase | null = null;
    let finishRank: number;

    if (isChampion) {
      finish = 'CHAMPION';
      finishRank = 0;
    } else if (final) {
      finish = final.winnerId ? 'RUNNER_UP' : 'FINALIST';
      finishRank = 1;
    } else if (thirdPlace?.winnerId) {
      const wonThird = mySideIds.has(thirdPlace.winnerId);
      finish = wonThird ? 'THIRD' : 'FOURTH';
      finishRank = wonThird ? 2 : 3;
    } else if (myMatches.length > 0) {
      phase = myMatches.reduce<MatchPhase>(
        (deepest, match) =>
          PHASE_DEPTH[match.matchPhase] > PHASE_DEPTH[deepest]
            ? match.matchPhase
            : deepest,
        myMatches[0]!.matchPhase,
      );
      finish = 'ELIMINATED';
      finishRank = 10 - PHASE_DEPTH[phase];
    } else {
      finish = 'NOT_STARTED';
      finishRank = 20;
    }

    return {
      championshipId: championship.id,
      title: championship.title,
      createdAtIso: championship.createdAt.toISO() ?? new Date().toISOString(),
      isDuo: championship.isDuo,
      matchesPlayed: myMatches.length,
      goals,
      finish,
      phase,
      finishRank,
      playedFinal: !!final,
      wonFinal:
        !!final && final.winnerId !== null && mySideIds.has(final.winnerId),
      goldenBoot: this._wonGoldenBoot(championship, mySideIds),
    };
  }

  /**
   * Same rule as the championship page: only finished cups award a golden
   * boot, and it goes to the side with the most goals.
   */
  private _wonGoldenBoot(
    championship: PlayerSummaryChampionshipData,
    mySideIds: Set<string>,
  ): boolean {
    if (championship.winnerId === null || mySideIds.size === 0) return false;

    const goalsBySide = new Map<string, number>();
    for (const match of championship.matches) {
      for (const participant of match.participants) {
        goalsBySide.set(
          participant.id,
          (goalsBySide.get(participant.id) ?? 0) + participant.goals,
        );
      }
    }

    let topSide: string | null = null;
    let topGoals = 0;
    goalsBySide.forEach((goals, sideId) => {
      if (goals > topGoals) {
        topGoals = goals;
        topSide = sideId;
      }
    });

    return topSide !== null && mySideIds.has(topSide);
  }

  /** 1v1 record against each opponent. Duo matches are left out, as on the head-to-head page. */
  private _opponents(
    championships: PlayerSummaryChampionshipData[],
    playerId: string,
  ): PlayerSummaryOpponentDto[] {
    const records = new Map<string, PlayerSummaryOpponentDto>();

    const oneVsOne = (match: PlayerSummaryMatchData): boolean =>
      match.participants.length === 2 &&
      match.participants.every((participant) => !participant.isDuo);

    for (const championship of championships) {
      for (const match of championship.matches.filter(oneVsOne)) {
        const me = match.participants.find((p) => p.id === playerId);
        const opponent = match.participants.find((p) => p.id !== playerId);
        if (!me || !opponent) continue;

        const record = records.get(opponent.id) ?? {
          opponentId: opponent.id,
          opponentName: opponent.name,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        };

        record.matchesPlayed += 1;
        if (match.winnerId === playerId) record.wins += 1;
        else if (match.winnerId === opponent.id) record.losses += 1;
        else if (match.winnerId === null) record.draws += 1;
        record.goalsFor += me.goals;
        record.goalsAgainst += opponent.goals;

        records.set(opponent.id, record);
      }
    }

    return [...records.values()].sort(
      (a, b) =>
        b.matchesPlayed - a.matchesPlayed ||
        b.wins - a.wins ||
        a.opponentName.localeCompare(b.opponentName),
    );
  }
}
