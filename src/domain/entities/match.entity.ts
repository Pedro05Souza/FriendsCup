import type { MatchPhase } from '../constants';

interface ParticipantGoals {
  participantId: string;
  goals: number;
  penaltyShootoutGoals?: number;
  playerId?: string | null; // Optional field for player ID
  duoId?: string | null; // Optional field for duo ID
}

export interface MatchEntity {
  id: string;
  participantsIds: string[];
  winnerId: string | null;
  participantGoals: ParticipantGoals[];
  matchPhase: MatchPhase;
}
