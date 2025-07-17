import { Inject, Injectable } from '@nestjs/common';
import { ChampionshipDto } from 'src/application/dtos/championship.dto';
import { MatchDto } from 'src/application/dtos/match.dto';
import { ChampionshipEntity } from 'src/domain/entities/championship.entity';
import { GroupEntity } from 'src/domain/entities/group.entity';
import { MatchEntity } from 'src/domain/entities/match.entity';
import { DuoEntity, PlayerEntity } from 'src/domain/entities/player.entity';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';

@Injectable()
export class ChampionshipDtoAssembler {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}
  async toDto(
    championshipEntity: ChampionshipEntity,
  ): Promise<ChampionshipDto> {
    const matches = await this._championshipRepository.getMatchesByIds(
      championshipEntity.matchIds,
    );

    const players =
      await this._championshipRepository.findParticipantsByChampionshipId(
        championshipEntity.id,
      );

    let groups: GroupEntity[] = [];
    if (championshipEntity.groupIds.length > 0) {
      groups = await this._championshipRepository.getGroupsByIds(
        championshipEntity.groupIds,
      );
    }

    const sortedMatches = matches.sort(
      (a, b) =>
        this.getPhaseOrder(a.matchPhase) - this.getPhaseOrder(b.matchPhase),
    );

    const goldenBootWinner = championshipEntity.winnerId
      ? this.calculateGoldenBootWinner(matches, players)
      : undefined;

    return {
      id: championshipEntity.id,
      title: championshipEntity.title,
      createdAtIso:
        championshipEntity.createdAt.toISO() ?? new Date().toISOString(),
      championshipWinner: this.getChampionshipWinner(
        championshipEntity.winnerId,
        players,
      ),
      goldenBootWinner: goldenBootWinner,
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        overallRating: this.getOverallRatingForPlayer(player),
      })),
      groups: groups.map((group) => ({
        id: group.id,
        players: group.groupPlayers
          .map((participant) => ({
            id: participant.id,
            name: this.getParticipantName(participant),
            points: participant.points,
            goalDifference: participant.goalDifference,
          }))
          .sort(
            (a, b) =>
              b.points - a.points ||
              b.goalDifference - a.goalDifference ||
              a.name.localeCompare(b.name),
          ),
      })),
      matches: sortedMatches.map((match) => this.mapMatchToDto(match, players)),
    };
  }

  private mapMatchToDto(
    match: MatchEntity,
    players: Array<DuoEntity | PlayerEntity>,
  ): MatchDto {
    const participantsMap = new Map(
      players.map((participant) => [participant.id, participant]),
    );

    const hasAnyPenalties = match.participantGoals.some(
      (goal) => (goal.penaltyShootoutGoals ?? 0) > 0,
    );

    return {
      id: match.id,
      matchPhase: match.matchPhase,
      participants: match.participantGoals.map((goal) => ({
        id: goal.playerId ?? goal.duoId ?? goal.participantId,
        goals: goal.goals,
        penaltyShootoutGoals: hasAnyPenalties
          ? (goal.penaltyShootoutGoals ?? 0)
          : undefined,
        name: this.getParticipantName(
          participantsMap.get(
            (goal.playerId ?? goal.duoId ?? goal.participantId) as string,
          ),
        ),
      })),
      winnerId: match.winnerId,
      winnerName: match.winnerId
        ? this.getParticipantName(participantsMap.get(match.winnerId))
        : null,
    };
  }

  private calculateGoldenBootWinner(
    matches: MatchEntity[],
    players: Array<DuoEntity | PlayerEntity>,
  ): { id: string; name: string; goals: number } | undefined {
    const goalCounts = new Map<string, number>();

    matches.forEach((match) => {
      match.participantGoals.forEach((participantGoal) => {
        const participantId =
          participantGoal.playerId ??
          participantGoal.duoId ??
          participantGoal.participantId;
        if (participantId) {
          const currentGoals = goalCounts.get(participantId) ?? 0;
          goalCounts.set(participantId, currentGoals + participantGoal.goals);
        }
      });
    });

    let maxGoals = 0;
    let goldenBootWinnerId: string | undefined = undefined;

    goalCounts.forEach((goals, participantId) => {
      if (goals > maxGoals) {
        maxGoals = goals;
        goldenBootWinnerId = participantId;
      }
    });

    if (goldenBootWinnerId && maxGoals > 0) {
      const winner = players.find((p) => p.id === goldenBootWinnerId);
      return winner
        ? {
            id: goldenBootWinnerId,
            name: this.getParticipantName(winner),
            goals: maxGoals,
          }
        : undefined;
    }

    return undefined;
  }

  private getChampionshipWinner(
    winnerId: string | null | undefined,
    players: Array<DuoEntity | PlayerEntity>,
  ): { id: string; name: string } | undefined {
    if (!winnerId) {
      return undefined;
    }

    const winner = players.find((p) => p.id === winnerId);
    if (!winner?.name) {
      return undefined;
    }

    return {
      id: winnerId,
      name: winner.name,
    };
  }

  private getPhaseOrder(phase: string): number {
    const phaseOrder = {
      GROUP_STAGE: 0,
      ROUND_OF_16: 1,
      QUARTER_FINALS: 2,
      SEMIFINALS: 3,
      THIRD_PLACE: 4,
      FINALS: 5,
    };
    return phaseOrder[phase as keyof typeof phaseOrder] ?? 999;
  }

  private getParticipantName(
    participant: DuoEntity | PlayerEntity | undefined,
  ): string {
    if (participant === undefined) {
      return 'Unknown Player';
    }

    return participant.name ?? 'Unnamed Participant';
  }

  private getOverallRatingForPlayer(
    player: PlayerEntity | DuoEntity,
  ): number | undefined {
    if ('intelligence' in player) {
      return player.getOverallRating();
    }
    return undefined;
  }
}
