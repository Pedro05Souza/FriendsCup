import type { MatchEntity } from 'src/domain/entities/match.entity';
import type { MatchData } from '../championship.repository';
import type { MatchPhase } from 'src/domain/constants';

export function mapToMatchEntity(match: MatchData): MatchEntity {
  return {
    id: match.id,
    participantsIds: match.participants.map((participant) => participant.id),
    winnerId: match.winnerId ?? match.duoWinnerId,
    participantGoals: match.participants.map((participant) => ({
      participantId: participant.id,
      goals: participant.goals,
      penaltiesShootoutGoals: participant.penaltyShootoutGoals,
      playerId: participant.playerId,
      duoId: participant.duoId,
    })),
    matchPhase: match.matchPhase as MatchPhase,
  };
}
