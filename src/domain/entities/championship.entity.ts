import type { DateTime } from 'luxon';
import type { MatchEntity } from './match.entity';
import type { DuoEntity, PlayerEntity } from './player.entity';

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

export interface CompleteChampionshipEntity
  extends Omit<
    ChampionshipEntity,
    'groupIds' | 'matchIds' | 'participantsIds'
  > {
  matches: MatchEntity[];
  participants: PlayerEntity[] | DuoEntity[];
}
