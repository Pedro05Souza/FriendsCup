export interface PlayerEntity {
  id: string;
  name: string;
  intelligence: number;
  defense: number;
  attack: number;
  mentality: number;
  goalsScored: number;
  goalsConceded: number;
}

export type NewPlayerEntity = Omit<
  PlayerEntity,
  'id' | 'rating' | 'scorePoints' | 'goalsScored' | 'goalsConceded'
>;
