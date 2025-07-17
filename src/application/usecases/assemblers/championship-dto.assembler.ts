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

    return {
      id: championshipEntity.id,
      title: championshipEntity.title,
      createdAtIso:
        championshipEntity.createdAt.toISO() ?? new Date().toISOString(),
      championshipWinnerId: championshipEntity.winnerId,
      championshipWinnerName: players.find(
        (p) => p.id === championshipEntity.winnerId,
      )?.name,
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        overallRating: this.getOverallRatingForPlayer(player),
      })),
      groups: groups.map((group) => ({
        id: group.id,
        players: group.groupPlayers.map((participant) => ({
          id: participant.id,
          name: this.getParticipantName(participant),
          points: participant.points,
          goalDifference: participant.goalDifference,
        })),
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

  private getPhaseOrder(phase: string): number {
    const phaseOrder = {
      GROUP_STAGE: 0,
      ROUND_OF_16: 1,
      QUARTER_FINALS: 2,
      SEMIFINALS: 3,
      THIRD_PLACE_MATCH: 4,
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
