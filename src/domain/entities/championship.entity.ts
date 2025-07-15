import type { DateTime } from 'luxon';

export interface RawChampionshipEntity {
  id: string;
  title: string;
  createdAt: DateTime;
  isDuo: boolean;
}
