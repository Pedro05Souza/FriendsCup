import type { MatchPhase } from '../constants';

interface ParticipantGoals {
  participantId: string;
  goals: number;
  penaltyShootoutGoals?: number;
  playerId?: string | null;
  duoId?: string | null;
}

export interface MatchEntity {
  id: string;
  participantsIds: string[];
  winnerId: string | null;
  participantGoals: ParticipantGoals[];
  matchPhase: MatchPhase;
}
