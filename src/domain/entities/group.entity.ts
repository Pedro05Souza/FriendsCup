import type { GroupPlayersEntities } from './player.entity';

export interface GroupEntity {
  id: string;
  championshipId: string;
  groupPlayers: GroupPlayersEntities;
}
