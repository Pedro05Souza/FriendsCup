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
    const championship =
      await this._championshipRepository.findById(championshipId);

    if (championship === null) {
      throw new BadRequestException('Championship not found');
    }

    if (
      DUO_CHAMPIOSHIPS.includes(championship.title) &&
      !createMatch.duo1Id &&
      !createMatch.duo2Id
    ) {
      throw new BadRequestException('Duo is required for this championship');
    }

    if (
      !DUO_CHAMPIOSHIPS.includes(championship.title) &&
      (createMatch.duo1Id || createMatch.duo2Id)
    ) {
      throw new BadRequestException('Duo is not allowed for this championship');
    }

    await this._checkIfPlayersExist(
      createMatch.player1Id,
      createMatch.player2Id,
    );

    await this._checkifDuosExist(createMatch.duo1Id, createMatch.duo2Id);

    if (
      !createMatch.player1Id &&
      !createMatch.duo1Id &&
      !createMatch.player2Id &&
      !createMatch.duo2Id
    ) {
      throw new BadRequestException('At least one player or duo is required');
    }

    if (
      createMatch.player1Id === createMatch.player2Id &&
      createMatch.duo1Id === createMatch.duo2Id
    ) {
      throw new BadRequestException('Players or duos must be different');
    }

    await this._championshipRepository.createMatch({
      playerId: createMatch.player1Id,
      duoId: createMatch.duo1Id,
      playerGoals: createMatch.player1Goals,
      matchPhase: createMatch.matchPhase as MatchPhase,
      isPenaltyShootout: createMatch.isPenaltyShootout,
      penaltyShootoutScore: createMatch.player1PenaltyShootout,
      championshipId,
    });

    await this._championshipRepository.createMatch({
      playerId: createMatch.player2Id,
      duoId: createMatch.duo2Id,
      playerGoals: createMatch.player2Goals,
      matchPhase: createMatch.matchPhase as MatchPhase,
      isPenaltyShootout: createMatch.isPenaltyShootout,
      penaltyShootoutScore: createMatch.player2PenaltyShootout,
      championshipId,
    });

    if (createMatch.matchPhase !== matchPhaseEnum.Values.GROUP_STAGE) {
      
      return;
    }

    let group = await this.getGroupByPlayerOrDuo(
      createMatch.player1Id,
      createMatch.duo1Id,
    );

    group ??=
      await this._championshipRepository.createChampionshipGroup(
        championshipId,
      );

    const groupPlayer1 = await this._getGroupPlayerOrDuo(
      group,
      createMatch.player1Id ?? (createMatch.duo1Id as string),
      !!createMatch.duo1Id,
    );

    const groupPlayer2 = await this._getGroupPlayerOrDuo(
      group,
      createMatch.player2Id ?? (createMatch.duo2Id as string),
      !!createMatch.duo2Id,
    );

    const scorePoints = this._defineScorePointsForMatch(
      createMatch.player1Goals,
      createMatch.player2Goals,
      createMatch.isPenaltyShootout,
      createMatch.player1PenaltyShootout,
      createMatch.player2PenaltyShootout,
    );

    groupPlayer1.points += scorePoints.player1Score;
    groupPlayer2.points += scorePoints.player2Score;
    groupPlayer1.goalDifference +=
      createMatch.player1Goals - createMatch.player2Goals;
    groupPlayer2.goalDifference +=
      createMatch.player2Goals - createMatch.player1Goals;

    await this._championshipRepository.updateGroupParticipant(groupPlayer1);
    await this._championshipRepository.updateGroupParticipant(groupPlayer2);
  }

  private async getGroupByPlayerOrDuo(
    playerId?: string,
    duoId?: string,
  ): Promise<GroupEntity | null> {
    if (duoId) {
      return this._championshipRepository.getGroupByDuoId(duoId);
    } else if (playerId) {
      return this._championshipRepository.getGroupByPlayerId(playerId);
    }

    throw new BadRequestException('Player or Duo ID must be provided');
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
    isPenaltyShootout: boolean,
    player1PenaltyShootout?: number,
    player2PenaltyShootout?: number,
  ): MatchScoreResult {
    if (player1Goals > player2Goals) {
      return { player1Score: 3, player2Score: 0 };
    }

    if (player1Goals < player2Goals) {
      return { player1Score: 0, player2Score: 3 };
    }

    if (isPenaltyShootout) {
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
    return { player1Score: 1, player2Score: 1 };
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
        return groupPlayer.id === id;
      } else {
        return groupPlayer.id === id;
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
}
