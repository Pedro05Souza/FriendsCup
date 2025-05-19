export interface PlayerEntity {
  id: string;
  name: string;
  rating: number;
  goalPerGame: number;
}

export type NewPlayerEntity = Omit<
  PlayerEntity,
  'id' | 'rating' | 'scorePoints'
>;
