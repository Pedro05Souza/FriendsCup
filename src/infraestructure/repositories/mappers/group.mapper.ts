import type { GroupEntity } from 'src/domain/entities/group.entity';
import type {
  ChampionshipGroupData,
  GroupPlayerData,
} from '../championship.repository';
import { GroupDuoEntity } from 'src/domain/entities/player.entity';
import { GroupPlayerEntity } from 'src/domain/entities/player.entity';
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
    return new GroupPlayerEntity(
      playerModelToEntity(groupPlayer.player),
      groupPlayer.points,
      groupPlayer.goalDifference,
      groupPlayer.id,
    );
  } else if (groupPlayer.duo) {
    return new GroupDuoEntity(
      groupPlayer.duo.id,
      playerModelToEntity(groupPlayer.duo.player1),
      playerModelToEntity(groupPlayer.duo.player2),
      groupPlayer.duo.name,
      groupPlayer.points,
      groupPlayer.goalDifference,
      groupPlayer.id,
    );
  }
  throw new Error('Invalid Group Player Data');
}
