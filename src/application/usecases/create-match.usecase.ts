import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  championshipRepositoryToken,
  ChampionshipRepository,
} from 'src/domain/interfaces/championship.interface';
import { DUO_CHAMPIOSHIPS, MatchPhase } from 'src/domain/constants';
import { CreateMatchDto } from '../dtos/create-match.dto';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { matchPhaseEnum } from '../dtos/enums';
import { GroupEntity } from 'src/domain/entities/group.entity';
import {
  GroupDuoEntity,
  GroupPlayerEntity,
} from 'src/domain/entities/player.entity';

interface MatchScoreResult {
  player1Score: number;
  player2Score: number;
}

interface MatchDetails {
  firstParticipantId: string;
  firstParticipantGoals: number;
  secondParticipantId: string;
  secondParticipantGoals: number;
  matchPhase: MatchPhase;
  firstParticipantPenaltyShootout?: number;
  secondParticipantPenaltyShootout?: number;
}

@Injectable()
export class CreateMatchUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async createMatch(
    championshipId: string,
    createMatch: CreateMatchDto,
  ): Promise<void> {
    if (createMatch.participants.length !== 2) {
      throw new BadRequestException('Match must have exactly two participants');
    }

    if (!createMatch.participants[0] || !createMatch.participants[1]) {
      throw new BadRequestException('Both participants must be provided');
    }

    const matchDetails = {
      firstParticipantId: createMatch.participants[0].id,
      firstParticipantGoals: createMatch.participants[0].goals,
      secondParticipantId: createMatch.participants[1].id,
      secondParticipantGoals: createMatch.participants[1].goals,
      matchPhase: createMatch.matchPhase,
      firstParticipantPenaltyShootout:
        createMatch.participants[0].penaltyShootoutGoals,
      secondParticipantPenaltyShootout:
        createMatch.participants[1].penaltyShootoutGoals,
    } as MatchDetails;

    const championship =
      await this._championshipRepository.findChampionshipById(championshipId);

    if (championship === null) {
      throw new BadRequestException('Championship not found');
    }

    const isDuo = DUO_CHAMPIOSHIPS.includes(championship.title);

    if (matchDetails.firstParticipantId === matchDetails.secondParticipantId) {
      throw new BadRequestException('Participants must be different');
    }

    if (isDuo) {
      await this._checkifDuosExist(
        matchDetails.firstParticipantId,
        matchDetails.secondParticipantId,
      );
    } else {
      await this._checkIfPlayersExist(
        matchDetails.firstParticipantId,
        matchDetails.secondParticipantId,
      );

      await this.registerChampionshipForParticipants(championshipId, [
        matchDetails.firstParticipantId,
        matchDetails.secondParticipantId,
      ]);
    }

    const scorePoints = this._defineScorePointsForMatch(
      matchDetails.firstParticipantGoals,
      matchDetails.secondParticipantGoals,
      matchDetails.firstParticipantPenaltyShootout,
      matchDetails.secondParticipantPenaltyShootout,
    );

    let winnerId: string | undefined;

    if (scorePoints.player1Score > scorePoints.player2Score) {
      winnerId = matchDetails.firstParticipantId;
    } else if (scorePoints.player1Score < scorePoints.player2Score) {
      winnerId = matchDetails.secondParticipantId;
    }

    const matchEntity = await this._championshipRepository.createMatch(
      championshipId,
      createMatch.matchPhase as MatchPhase,
      isDuo ? undefined : winnerId,
      isDuo ? winnerId : undefined,
    );

    await this._createMatchForParticipants(matchEntity.id, matchDetails, isDuo);

    if (matchDetails.matchPhase !== matchPhaseEnum.Values.GROUP_STAGE) {
      if (matchDetails.matchPhase === matchPhaseEnum.Values.FINALS) {
        await this._championshipRepository.updateChampionshipWinner(
          championshipId,
          isDuo ? undefined : winnerId,
          isDuo ? winnerId : undefined,
        );
      }

      return;
    }

    const group = await this._resolveGroupForParticipants(
      championshipId,
      matchDetails.firstParticipantId,
      matchDetails.secondParticipantId,
      createMatch.groupId,
    );

    const firstParticipantGroupStatus = await this._getGroupPlayerOrDuo(
      group,
      matchDetails.firstParticipantId,
      isDuo,
    );

    const secondParticipantGroupStatus = await this._getGroupPlayerOrDuo(
      group,
      matchDetails.secondParticipantId,
      isDuo,
    );

    firstParticipantGroupStatus.points += scorePoints.player1Score;
    secondParticipantGroupStatus.points += scorePoints.player2Score;
    firstParticipantGroupStatus.goalDifference +=
      matchDetails.firstParticipantGoals - matchDetails.secondParticipantGoals;
    secondParticipantGroupStatus.goalDifference +=
      matchDetails.secondParticipantGoals - matchDetails.firstParticipantGoals;

    await this._championshipRepository.updateGroupParticipant(
      firstParticipantGroupStatus,
    );
    await this._championshipRepository.updateGroupParticipant(
      secondParticipantGroupStatus,
    );
  }

  private async _checkIfPlayersExist(
    player1Id: string | undefined,
    player2Id: string | undefined,
  ): Promise<void> {
    if (player1Id) {
      const player1 = await this._playerRepository.findById(player1Id);

      if (player1 === null) {
        throw new BadRequestException(
          `Player 1 with ID ${player1Id} not found`,
        );
      }
    }

    if (player2Id) {
      const player2 = await this._playerRepository.findById(player2Id);
      if (player2 === null) {
        throw new BadRequestException(
          `Player 2 with ID ${player2Id} not found`,
        );
      }
    }
  }

  private async _checkifDuosExist(
    duo1Id: string | undefined,
    duo2Id: string | undefined,
  ): Promise<void> {
    if (duo1Id) {
      const duo1 = await this._championshipRepository.getDuoPlayersById(duo1Id);

      if (duo1 === null) {
        throw new BadRequestException(`Duo 1 with ID ${duo1Id} not found`);
      }
    }

    if (duo2Id) {
      const duo2 = await this._championshipRepository.getDuoPlayersById(duo2Id);

      if (duo2 === null) {
        throw new BadRequestException(`Duo 2 with ID ${duo2Id} not found`);
      }
    }
  }

  private _defineScorePointsForMatch(
    player1Goals: number,
    player2Goals: number,

    player1PenaltyShootout?: number,
    player2PenaltyShootout?: number,
  ): MatchScoreResult {
    if (player1Goals > player2Goals) {
      return { player1Score: 3, player2Score: 0 };
    }

    if (player1Goals < player2Goals) {
      return { player1Score: 0, player2Score: 3 };
    }

    if (
      player1PenaltyShootout !== undefined &&
      player2PenaltyShootout !== undefined
    ) {
      if (player1PenaltyShootout > player2PenaltyShootout) {
        return { player1Score: 3, player2Score: 0 };
      } else if (player1PenaltyShootout < player2PenaltyShootout) {
        return { player1Score: 0, player2Score: 3 };
      }
    }
    return { player1Score: 1, player2Score: 1 };
  }

  private async _resolveGroupForParticipants(
    championshipId: string,
    firstParticipantId: string,
    secondParticipantId: string,
    groupId?: string,
  ): Promise<GroupEntity> {
    if (groupId) {
      const group = await this._championshipRepository.getGroupById(groupId);
      if (group === null) {
        throw new BadRequestException(`Group with ID ${groupId} not found`);
      }
      return group;
    }
    const firstParticipantGroup =
      await this._championshipRepository.getGroupByParticipantId(
        firstParticipantId,
        championshipId,
      );
    const secondParticipantGroup =
      await this._championshipRepository.getGroupByParticipantId(
        secondParticipantId,
        championshipId,
      );

    if (
      firstParticipantGroup &&
      secondParticipantGroup &&
      firstParticipantGroup.id !== secondParticipantGroup.id
    ) {
      throw new BadRequestException(
        'Participants cannot be in different groups for a group stage match',
      );
    }

    if (firstParticipantGroup) {
      return firstParticipantGroup;
    }

    if (secondParticipantGroup) {
      return secondParticipantGroup;
    }

    return this._championshipRepository.createChampionshipGroup(championshipId);
  }

  private async _getGroupPlayerOrDuo(
    group: GroupEntity,
    id: string,
    isDuo: boolean,
  ): Promise<GroupDuoEntity | GroupPlayerEntity> {
    if (group.groupPlayers.length === 0) {
      return this._championshipRepository.createGroupParticipant({
        points: 0,
        goalDifference: 0,
        championshipGroupId: group.id,
        ...(isDuo ? { duoId: id } : { playerId: id }),
      });
    }

    const groupUser = group.groupPlayers.find((groupPlayer) => {
      if (isDuo) {
        return (groupPlayer as GroupDuoEntity).id === id;
      } else {
        return (groupPlayer as GroupPlayerEntity).id === id;
      }
    });

    if (groupUser === undefined) {
      return this._championshipRepository.createGroupParticipant({
        points: 0,
        goalDifference: 0,
        championshipGroupId: group.id,
        ...(isDuo ? { duoId: id } : { playerId: id }),
      });
    }

    return groupUser;
  }

  private async _createMatchForParticipants(
    matchId: string,
    matchDetails: MatchDetails,
    isDuo: boolean,
  ): Promise<void> {
    await this._createParticipantForMatch(
      matchId,
      matchDetails.firstParticipantId,
      matchDetails.firstParticipantGoals,
      isDuo,
      matchDetails.firstParticipantPenaltyShootout,
    );

    await this._createParticipantForMatch(
      matchId,
      matchDetails.secondParticipantId,
      matchDetails.secondParticipantGoals,
      isDuo,
      matchDetails.secondParticipantPenaltyShootout,
    );
  }

  private async _createParticipantForMatch(
    matchId: string,
    participantId: string,
    goals: number,
    isDuo: boolean,
    penaltyShootoutGoals?: number,
  ): Promise<void> {
    const matchParams = {
      matchId,
      playerId: isDuo ? undefined : participantId,
      duoId: isDuo ? participantId : undefined,
      playerGoals: goals,
      penaltyShootoutGoals: penaltyShootoutGoals,
      goals: goals,
    };

    await this._championshipRepository.createMatchParticipant(matchParams);
  }

  private async registerChampionshipForParticipants(
    championshipId: string,
    playerIds: string[],
  ): Promise<void> {
    const registeredParticipants =
      await this._championshipRepository.findParticipantsByChampionshipId(
        championshipId,
      );

    playerIds = playerIds.filter((playerId) => {
      return !registeredParticipants.some((participant) => {
        if ('player1' in participant && 'player2' in participant) {
          return (
            participant.player1.id === playerId ||
            participant.player2.id === playerId
          );
        } else {
          return participant.id === playerId;
        }
      });
    });

    await this._championshipRepository.bulkCreateParticipantsForChampionship({
      championshipId,
      playerIds,
    });
  }
}
