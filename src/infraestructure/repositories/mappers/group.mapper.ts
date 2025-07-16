import type { GroupEntity } from 'src/domain/entities/group.entity';
import type {
  ChampionshipGroupData,
  GroupPlayerData,
} from '../championship.repository';
import type {
  GroupDuoEntity,
  GroupPlayerEntity,
} from 'src/domain/entities/player.entity';
import { playerModelToEntity } from './player.mapper';

export function mapToGroupEntity(group: ChampionshipGroupData): GroupEntity {
  return {
    id: group.id,
    groupPlayers: group.groupPlayers.map((groupPlayer) => {
      return mapToGroupParticipant(groupPlayer);
    }),
  };
}

export function mapToGroupParticipant(
  groupPlayer: GroupPlayerData,
): GroupPlayerEntity | GroupDuoEntity {
  if (groupPlayer.player) {
    return {
      ...playerModelToEntity(groupPlayer.player),
      points: groupPlayer.points,
      goalDifference: groupPlayer.goalDifference,
      groupPlayerId: groupPlayer.id,
    };
  } else if (groupPlayer.duo) {
    return {
      id: groupPlayer.duo.id,
      player1: playerModelToEntity(groupPlayer.duo.player1),
      player2: playerModelToEntity(groupPlayer.duo.player2),
      points: groupPlayer.points,
      goalDifference: groupPlayer.goalDifference,
      groupPlayerId: groupPlayer.id,
    };
  }
  throw new Error('Invalid Group Player Data');
}
