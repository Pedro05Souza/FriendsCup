export interface PlayerEntityParams {
  id: string;
  name: string;
  intelligence: number;
  defense: number;
  attack: number;
  mentality: number;
}

export class PlayerEntity {
  id: string;
  name: string;
  intelligence: number;
  defense: number;
  attack: number;
  mentality: number;

  constructor(params: PlayerEntityParams) {
    this.id = params.id;
    this.name = params.name;
    this.intelligence = params.intelligence;
    this.defense = params.defense;
    this.attack = params.attack;
    this.mentality = params.mentality;
  }

  getOverallRating(): number {
    return Math.round(
      (this.intelligence + this.defense + this.attack + this.mentality) / 4,
    );
  }
}

export type NewPlayerEntity = Omit<
  PlayerEntity,
  'id' | 'rating' | 'scorePoints' | 'getOverallRating'
>;

export class DuoEntity {
  id: string;
  player1: PlayerEntity;
  player2: PlayerEntity;
  name: string;

  constructor(
    id: string,
    player1: PlayerEntity,
    player2: PlayerEntity,
    name: string,
  ) {
    this.id = id;
    this.player1 = player1;
    this.player2 = player2;
    this.name = name;
  }
}

export class GroupPlayerEntity extends PlayerEntity {
  points: number;
  goalDifference: number;
  groupPlayerId: string;

  constructor(
    params: PlayerEntityParams,
    points: number,
    goalDifference: number,
    groupPlayerId: string,
  ) {
    super(params);
    this.points = points;
    this.goalDifference = goalDifference;
    this.groupPlayerId = groupPlayerId;
  }
}

export class GroupDuoEntity extends DuoEntity {
  points: number;
  goalDifference: number;
  groupPlayerId: string;

  constructor(
    id: string,
    player1: PlayerEntity,
    player2: PlayerEntity,
    name: string,
    points: number,
    goalDifference: number,
    groupPlayerId: string,
  ) {
    super(id, player1, player2, name);
    this.points = points;
    this.goalDifference = goalDifference;
    this.groupPlayerId = groupPlayerId;
  }
}

export type GroupPlayersEntities = Array<GroupPlayerEntity | GroupDuoEntity>;
