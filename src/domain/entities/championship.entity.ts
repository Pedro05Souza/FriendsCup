import type { DateTime } from 'luxon';

export interface ChampionshipEntity {
  id: string;
  title: string;
  createdAt: DateTime;
  isDuo: boolean;
  matchIds: string[];
  participantsIds: string[];
}
