import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
  StoredMatch,
} from 'src/domain/interfaces/championship.interface';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { DUO_CHAMPIOSHIPS, MatchPhase } from 'src/domain/constants';
import { MatchSide, matchWinnerId } from 'src/domain/match-result';
import { ChampionshipEntity } from 'src/domain/entities/championship.entity';
import { UpdateMatchDto } from '../dtos/update-match.dto';
import { GroupStandingsService } from './group-standings.service';

/** The two sides of a stored match, as recorded. */
export function storedMatchSides(
  match: StoredMatch,
): [MatchSide, MatchSide] | null {
  const [first, second] = match.participantGoals;
  if (!first || !second) return null;
  const side = (p: typeof first): MatchSide => ({
    participantId: (p.playerId ?? p.duoId ?? p.participantId) as string,
    goals: p.goals,
    penaltyShootoutGoals: p.penaltyShootoutGoals,
  });
  return [side(first), side(second)];
}

/** Loads a championship and one of its matches, or fails with a clear message. */
export async function findMatchInChampionship(
  repository: ChampionshipRepository,
  championshipId: string,
  matchId: string,
): Promise<{ championship: ChampionshipEntity; match: StoredMatch }> {
  const championship = await repository.findChampionshipById(championshipId);
  if (championship === null) {
    throw new BadRequestException('Championship not found');
  }

  const match = await repository.getMatchById(matchId);
  if (match === null || match.championshipId !== championshipId) {
    throw new BadRequestException('Match not found in this championship');
  }

  return { championship, match };
}

@Injectable()
export class UpdateMatchUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
    private readonly _groupStandings: GroupStandingsService,
  ) {}

  async updateMatch(
    championshipId: string,
    matchId: string,
    updateMatch: UpdateMatchDto,
  ): Promise<void> {
    const [firstInput, secondInput] = updateMatch.participants;
    if (!firstInput || !secondInput) {
      throw new BadRequestException('Match must have exactly two participants');
    }
    if (firstInput.id === secondInput.id) {
      throw new BadRequestException('Participants must be different');
    }

    const { championship, match } = await findMatchInChampionship(
      this._championshipRepository,
      championshipId,
      matchId,
    );
    const isDuo = DUO_CHAMPIOSHIPS.includes(championship.title);

    await this._checkParticipantsExist(isDuo, firstInput.id, secondInput.id);
    if (!isDuo) {
      await this._registerPlayers(championshipId, [
        firstInput.id,
        secondInput.id,
      ]);
    }

    const newPhase = updateMatch.matchPhase as MatchPhase;
    const first: MatchSide = {
      participantId: firstInput.id,
      goals: firstInput.goals,
      penaltyShootoutGoals: firstInput.penaltyShootoutGoals,
    };
    const second: MatchSide = {
      participantId: secondInput.id,
      goals: secondInput.goals,
      penaltyShootoutGoals: secondInput.penaltyShootoutGoals,
    };
    const winnerId = matchWinnerId(first, second);

    // Take the old result out of the group table before replacing it
    const oldSides = storedMatchSides(match);
    if (match.matchPhase === 'GROUP_STAGE' && oldSides) {
      await this._groupStandings.removeResult(championshipId, ...oldSides);
    }

    await this._championshipRepository.updateMatch({
      matchId,
      matchPhase: newPhase,
      isDuo,
      winnerId,
      participants: [first, second].map((side) => ({
        participantId: side.participantId,
        goals: side.goals,
        penaltyShootoutGoals: side.penaltyShootoutGoals ?? undefined,
      })),
    });

    if (newPhase === 'GROUP_STAGE') {
      await this._groupStandings.addResult(
        championshipId,
        isDuo,
        first,
        second,
        updateMatch.groupId,
      );
    }

    // The final decides the champion
    if (newPhase === 'FINALS') {
      await this._championshipRepository.setChampionshipWinner(
        championshipId,
        winnerId,
        isDuo,
      );
    } else if (match.matchPhase === 'FINALS') {
      await this._championshipRepository.setChampionshipWinner(
        championshipId,
        null,
        isDuo,
      );
    }
  }

  private async _checkParticipantsExist(
    isDuo: boolean,
    ...ids: string[]
  ): Promise<void> {
    for (const id of ids) {
      const found = isDuo
        ? await this._championshipRepository.getDuoPlayersById(id)
        : await this._playerRepository.findById(id);
      if (found === null) {
        throw new BadRequestException(
          `${isDuo ? 'Duo' : 'Player'} with ID ${id} not found`,
        );
      }
    }
  }

  private async _registerPlayers(
    championshipId: string,
    playerIds: string[],
  ): Promise<void> {
    const registered =
      await this._championshipRepository.findParticipantsByChampionshipId(
        championshipId,
      );
    const registeredIds = new Set(
      registered.map((participant) => participant.id),
    );
    const missing = playerIds.filter((id) => !registeredIds.has(id));

    if (missing.length > 0) {
      await this._championshipRepository.bulkCreateParticipantsForChampionship({
        championshipId,
        playerIds: missing,
      });
    }
  }
}
