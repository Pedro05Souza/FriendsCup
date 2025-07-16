import { Inject, Injectable } from '@nestjs/common';
import { ChampionshipDto } from 'src/application/dtos/championship.dto';
import { MatchDto } from 'src/application/dtos/match.dto';
import { ChampionshipEntity } from 'src/domain/entities/championship.entity';
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

    return {
      id: championshipEntity.id,
      title: championshipEntity.title,
      createdAtIso:
        championshipEntity.createdAt.toISO() ?? new Date().toISOString(),
      championshipWinnerId: championshipEntity.winnerId,
      championshipWinnerName: players.find(
        (p) => p.id === championshipEntity.winnerId,
      )?.name,
      matches: matches.map((match) => this.mapMatchToDto(match, players)),
      players: players.map((player) => ({
        id: player.id,
        name: player.name,
        overallRating: this.getOverallRatingForPlayer(player),
      })),
    };
  }

  private mapMatchToDto(
    match: MatchEntity,
    players: Array<DuoEntity | PlayerEntity>,
  ): MatchDto {
    const participantsMap = new Map(
      players.map((participant) => [participant.id, participant]),
    );
    return {
      id: match.id,
      matchPhase: match.matchPhase,
      participants: match.participantGoals.map((goal) => ({
        id: goal.playerId ?? goal.duoId ?? goal.participantId,
        goals: goal.goals,
        penaltyShootoutGoals: goal.penaltyShootoutGoals,
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
