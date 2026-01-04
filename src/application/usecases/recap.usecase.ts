import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { TournamentName } from '../dtos/enums';
import { CompleteChampionshipEntity } from 'src/domain/entities/championship.entity';
import {
  MatchEntity,
  ParticipantGoals,
} from 'src/domain/entities/match.entity';
import { DuoEntity } from 'src/domain/entities/player.entity';

export interface RawGoldenBootPodium {
  playerId: string;
  goals: number;
  matchesPlayed: number;
}

export interface RawDefensePodium {
  playerId: string;
  goalsConceded: number;
  matchesPlayed: number;
}

export interface GoldenBootPodium extends RawGoldenBootPodium {
  playerName: string;
  avgGoals: number;
}

export interface DefensePodium extends RawDefensePodium {
  playerName: string;
  avgGoalsConceded: number;
}

export interface RawTitlesPodium {
  playerId: string;
  titlesWon: Partial<Record<TournamentName, number>>;
}

export interface TitlesPodium extends RawTitlesPodium {
  playerName: string;
}

export interface RawRunnerUpPodium {
  playerId: string;
  runnerUps: Partial<Record<TournamentName, number>>;
}

export interface RunnerUpPodium extends RawRunnerUpPodium {
  playerName: string;
}

export interface RawRecapData {
  goldenBootPodium: RawGoldenBootPodium[];
  defensePodium: RawDefensePodium[];
  titlesPodium: RawTitlesPodium[];
  runnerUpPodium: RawRunnerUpPodium[];
}

export interface RecapData {
  goldenBootPodium: GoldenBootPodium[];
  defensePodium: DefensePodium[];
  titlesPodium: TitlesPodium[];
  runnerUpPodium: RunnerUpPodium[];
}

@Injectable()
export class RecapUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}
  async getRecap(year: string): Promise<RecapData> {
    const receivedData =
      await this._championshipRepository.getAllChampionshipsByYear(year);
    return this.generateRecapReport(receivedData);
  }

  private sumRecord(record: Partial<Record<TournamentName, number>>): number {
    return Object.values(record).reduce((sum, v) => sum + (v ?? 0), 0);
  }

  private buildPlayerMap(
    championships: CompleteChampionshipEntity[],
  ): Map<string, string> {
    const map = new Map<string, string>();

    championships.forEach((championship) => {
      championship.participants.forEach((participant) => {
        if ('player1' in participant) {
          map.set(participant.player1.id, participant.player1.name);
          map.set(participant.player2.id, participant.player2.name);
        } else {
          map.set(participant.id, participant.name);
        }
      });
    });

    return map;
  }

  private transformRawRecapData(
    raw: RawRecapData,
    playerMap: Map<string, string>,
  ): RecapData {
    const getName = (playerId: string): string => {
      const name = playerMap.get(playerId);
      if (!name) {
        throw new Error(`Player name not found for id ${playerId}`);
      }
      return name;
    };

    return {
      goldenBootPodium: raw.goldenBootPodium
        .map((p) => ({
          ...p,
          playerName: getName(p.playerId),
          avgGoals: Number((p.goals / p.matchesPlayed).toFixed(2)),
        }))
        .sort((a, b) => b.goals - a.goals),

      defensePodium: raw.defensePodium
        .map((p) => ({
          ...p,
          playerName: getName(p.playerId),
          avgGoalsConceded: Number(
            (p.goalsConceded / p.matchesPlayed).toFixed(2),
          ),
        }))
        .sort((a, b) => a.goalsConceded - b.goalsConceded),

      titlesPodium: raw.titlesPodium
        .map((p) => ({
          ...p,
          playerName: getName(p.playerId),
        }))
        .sort(
          (a, b) => this.sumRecord(b.titlesWon) - this.sumRecord(a.titlesWon),
        ),

      runnerUpPodium: raw.runnerUpPodium
        .map((p) => ({
          ...p,
          playerName: getName(p.playerId),
        }))
        .sort(
          (a, b) => this.sumRecord(b.runnerUps) - this.sumRecord(a.runnerUps),
        ),
    };
  }

  private async generateRecapReport(
    receivedData: CompleteChampionshipEntity[],
  ): Promise<RecapData> {
    const rawRecapData: RawRecapData = {
      goldenBootPodium: [],
      defensePodium: [],
      titlesPodium: [],
      runnerUpPodium: [],
    };

    receivedData.forEach((championship) => {
      championship.matches.forEach((match) => {
        this.addTitlesAndRunnerUpsToRecap(rawRecapData, championship, match);
        match.participantGoals.forEach((participantGoal) => {
          this.addDefenseAndGoldenBootToRecap(
            rawRecapData,
            championship,
            match,
            participantGoal,
          );
        });
      });
    });

    const playerMap = this.buildPlayerMap(receivedData);
    return this.transformRawRecapData(rawRecapData, playerMap);
  }

  private applyPlayerStatsToRecap(
    rawRecapData: RawRecapData,
    match: MatchEntity,
    goals: number,
    playerId: string,
    duoId?: string,
  ): void {
    const goldenBootPlayer = rawRecapData.goldenBootPodium.find(
      (p) => p.playerId === playerId,
    );

    if (goldenBootPlayer) {
      goldenBootPlayer.goals += goals;
      goldenBootPlayer.matchesPlayed += 1;
    } else {
      rawRecapData.goldenBootPodium.push({
        playerId,
        goals,
        matchesPlayed: 1,
      });
    }

    const goalsConceded = match.participantGoals
      .filter((pg) => pg.playerId !== playerId && pg.duoId !== duoId)
      .reduce((sum, pg) => sum + pg.goals, 0);

    const defensePlayer = rawRecapData.defensePodium.find(
      (p) => p.playerId === playerId,
    );

    if (defensePlayer) {
      defensePlayer.goalsConceded += goalsConceded;
      defensePlayer.matchesPlayed += 1;
    } else {
      rawRecapData.defensePodium.push({
        playerId,
        goalsConceded,
        matchesPlayed: 1,
      });
    }
  }

  private addDefenseAndGoldenBootToRecap(
    rawRecapData: RawRecapData,
    championship: CompleteChampionshipEntity,
    match: MatchEntity,
    participantGoal: ParticipantGoals,
  ): void {
    const playerId = participantGoal.playerId ?? participantGoal.duoId;
    const goals = participantGoal.goals;

    if (!playerId) {
      throw new Error('participantGoal.playerId is required');
    }

    if (championship.isDuo) {
      const duo = championship.participants.find(
        (p) => (p as DuoEntity).id === playerId,
      ) as DuoEntity | undefined;

      if (!duo) {
        throw new Error(`Duo with id ${playerId} not found`);
      }

      this.applyPlayerStatsToRecap(
        rawRecapData,
        match,
        goals,
        duo.player1.id,
        duo.id,
      );

      if (duo.player1.id === duo.player2.id) {
        return;
      }

      this.applyPlayerStatsToRecap(
        rawRecapData,
        match,
        goals,
        duo.player2.id,
        duo.id,
      );
    } else {
      this.applyPlayerStatsToRecap(rawRecapData, match, goals, playerId);
    }
  }

  private applyTitleAndRunnerUpStatsToRecap(
    rawRecapData: RawRecapData,
    championshipName: TournamentName,
    winnerId: string,
    runnerUpId: string,
  ): void {
    const titlesPlayer = rawRecapData.titlesPodium.find(
      (p) => p.playerId === winnerId,
    );

    if (titlesPlayer) {
      titlesPlayer.titlesWon[championshipName] =
        (titlesPlayer.titlesWon[championshipName] ?? 0) + 1;
    } else {
      rawRecapData.titlesPodium.push({
        playerId: winnerId,
        titlesWon: {
          [championshipName]: 1,
        },
      });
    }

    if (runnerUpId) {
      const runnerUpPlayer = rawRecapData.runnerUpPodium.find(
        (p) => p.playerId === runnerUpId,
      );

      if (runnerUpPlayer) {
        runnerUpPlayer.runnerUps[championshipName] =
          (runnerUpPlayer.runnerUps[championshipName] ?? 0) + 1;
      } else {
        rawRecapData.runnerUpPodium.push({
          playerId: runnerUpId,
          runnerUps: {
            [championshipName]: 1,
          },
        });
      }
    }
  }

  private addTitlesAndRunnerUpsToRecap(
    rawRecapData: RawRecapData,
    championship: CompleteChampionshipEntity,
    match: MatchEntity,
  ): void {
    if (match.matchPhase !== 'FINALS') {
      return;
    }

    const winnerId = match.winnerId;

    const runnerUp = match.participantGoals.find(
      (pg) => pg.playerId !== winnerId && pg.duoId !== winnerId,
    );

    if (!winnerId) {
      throw new Error('Match winnerId is required for finals');
    }

    if (!runnerUp) {
      throw new Error('Match runnerUp is required for finals');
    }

    const runnerUpId = runnerUp.playerId ?? runnerUp.duoId;

    if (!runnerUpId) {
      throw new Error('Match runnerUpId is required for finals');
    }

    if (championship.isDuo) {
      const duoWinner = championship.participants.find(
        (p) => (p as DuoEntity).id === winnerId,
      ) as DuoEntity | undefined;

      if (!duoWinner) {
        throw new Error(`Duo with id ${winnerId} not found`);
      }

      const duoRunnerUp = championship.participants.find(
        (p) => (p as DuoEntity).id === runnerUpId,
      ) as DuoEntity | undefined;

      if (!duoRunnerUp) {
        throw new Error(`Duo with id ${runnerUpId} not found`);
      }

      const winnerPlayers = [duoWinner.player1.id, duoWinner.player2.id].filter(
        (id, index, arr) => arr.indexOf(id) === index,
      );

      const runnerUpPlayers = [
        duoRunnerUp.player1.id,
        duoRunnerUp.player2.id,
      ].filter((id, index, arr) => arr.indexOf(id) === index);

      winnerPlayers.forEach((winnerPlayerId) => {
        this.applyTitleAndRunnerUpStatsToRecap(
          rawRecapData,
          championship.title as TournamentName,
          winnerPlayerId,
          undefined as unknown as string,
        );
      });

      runnerUpPlayers.forEach((runnerUpPlayerId) => {
        const runnerUpPlayer = rawRecapData.runnerUpPodium.find(
          (p) => p.playerId === runnerUpPlayerId,
        );

        if (runnerUpPlayer) {
          runnerUpPlayer.runnerUps[championship.title as TournamentName] =
            (runnerUpPlayer.runnerUps[championship.title as TournamentName] ??
              0) + 1;
        } else {
          rawRecapData.runnerUpPodium.push({
            playerId: runnerUpPlayerId,
            runnerUps: {
              [championship.title as TournamentName]: 1,
            },
          });
        }
      });
    } else {
      this.applyTitleAndRunnerUpStatsToRecap(
        rawRecapData,
        championship.title as TournamentName,
        winnerId,
        runnerUpId,
      );
    }
  }
}
