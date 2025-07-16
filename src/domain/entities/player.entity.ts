export interface PlayerEntity {
  id: string;
  name: string;
  intelligence: number;
  defense: number;
  attack: number;
  mentality: number;
}

export type NewPlayerEntity = Omit<
  PlayerEntity,
  'id' | 'rating' | 'scorePoints'
>;

export interface DuoEntity {
  id: string;
  player1: PlayerEntity;
  player2: PlayerEntity;
}

export interface GroupPlayerEntity extends PlayerEntity {
  points: number;
  goalDifference: number;
  groupPlayerId: string; // Database record ID for updates
}

export interface GroupDuoEntity extends DuoEntity {
  points: number;
  goalDifference: number;
  groupPlayerId: string; // Database record ID for updates
}

export type GroupPlayersEntities = Array<GroupPlayerEntity | GroupDuoEntity>;
