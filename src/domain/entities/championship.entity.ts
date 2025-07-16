import type { DateTime } from 'luxon';

export interface ChampionshipEntity {
  id: string;
  title: string;
  createdAt: DateTime;
  groupIds: string[];
  isDuo: boolean;
  matchIds: string[];
  participantsIds: string[];
  winnerId?: string;
}
