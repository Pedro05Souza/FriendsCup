import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { GroupEntity } from 'src/domain/entities/group.entity';
import {
  GroupDuoEntity,
  GroupPlayerEntity,
} from 'src/domain/entities/player.entity';
import { MatchSide, matchPoints } from 'src/domain/match-result';

type GroupRow = GroupPlayerEntity | GroupDuoEntity;

/**
 * Keeps group tables in step with group-stage results.
 *
 * Standings are stored as running totals, so a result is added when a match is
 * recorded and taken back out when it is edited or deleted. Rows for other
 * participants are never touched.
 */
@Injectable()
export class GroupStandingsService {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  /** Adds a group-stage result to the table, creating the group or rows if needed. */
  async addResult(
    championshipId: string,
    isDuo: boolean,
    first: MatchSide,
    second: MatchSide,
    groupId?: string,
  ): Promise<void> {
    const group = await this._resolveGroup(
      championshipId,
      first.participantId,
      second.participantId,
      groupId,
    );

    const firstRow = await this._findOrCreateRow(
      group,
      first.participantId,
      isDuo,
    );
    const secondRow = await this._findOrCreateRow(
      await this._refresh(group),
      second.participantId,
      isDuo,
    );

    await this._apply(firstRow, secondRow, first, second, 1);
  }

  /** Takes a previously recorded group-stage result back out of the table. */
  async removeResult(
    championshipId: string,
    first: MatchSide,
    second: MatchSide,
  ): Promise<void> {
    const group =
      (await this._championshipRepository.getGroupByParticipantId(
        first.participantId,
        championshipId,
      )) ??
      (await this._championshipRepository.getGroupByParticipantId(
        second.participantId,
        championshipId,
      ));

    if (group === null) return;

    const firstRow = this._findRow(group, first.participantId);
    const secondRow = this._findRow(group, second.participantId);

    if (!firstRow || !secondRow) return;

    await this._apply(firstRow, secondRow, first, second, -1);
  }

  private async _apply(
    firstRow: GroupRow,
    secondRow: GroupRow,
    first: MatchSide,
    second: MatchSide,
    sign: 1 | -1,
  ): Promise<void> {
    const points = matchPoints(
      first.goals,
      second.goals,
      first.penaltyShootoutGoals,
      second.penaltyShootoutGoals,
    );

    firstRow.points += sign * points.first;
    secondRow.points += sign * points.second;
    firstRow.goalDifference += sign * (first.goals - second.goals);
    secondRow.goalDifference += sign * (second.goals - first.goals);

    await this._championshipRepository.updateGroupParticipant(firstRow);
    await this._championshipRepository.updateGroupParticipant(secondRow);
  }

  private _findRow(
    group: GroupEntity,
    participantId: string,
  ): GroupRow | undefined {
    return group.groupPlayers.find((row) => row.id === participantId);
  }

  private async _findOrCreateRow(
    group: GroupEntity,
    participantId: string,
    isDuo: boolean,
  ): Promise<GroupRow> {
    const existing = this._findRow(group, participantId);
    if (existing) return existing;

    return this._championshipRepository.createGroupParticipant({
      points: 0,
      goalDifference: 0,
      championshipGroupId: group.id,
      ...(isDuo ? { duoId: participantId } : { playerId: participantId }),
    });
  }

  private async _refresh(group: GroupEntity): Promise<GroupEntity> {
    return (await this._championshipRepository.getGroupById(group.id)) ?? group;
  }

  private async _resolveGroup(
    championshipId: string,
    firstParticipantId: string,
    secondParticipantId: string,
    groupId?: string,
  ): Promise<GroupEntity> {
    if (groupId) {
      const group = await this._championshipRepository.getGroupById(groupId);
      if (group === null || group.championshipId !== championshipId) {
        throw new BadRequestException(`Group with ID ${groupId} not found`);
      }
      return group;
    }

    const firstGroup =
      await this._championshipRepository.getGroupByParticipantId(
        firstParticipantId,
        championshipId,
      );
    const secondGroup =
      await this._championshipRepository.getGroupByParticipantId(
        secondParticipantId,
        championshipId,
      );

    if (firstGroup && secondGroup && firstGroup.id !== secondGroup.id) {
      throw new BadRequestException(
        'Participants cannot be in different groups for a group stage match',
      );
    }

    return (
      firstGroup ??
      secondGroup ??
      (await this._championshipRepository.createChampionshipGroup(
        championshipId,
      ))
    );
  }
}
