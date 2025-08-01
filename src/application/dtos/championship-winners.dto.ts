import { z } from 'zod';

export const ChampionshipWinnersInfoSchema = z.object({
  championshipName: z.string(),
  timesWon: z.number().int().positive(),
});

export const ChampionshipWinnersSchema = z.object({
  playerId: z.string().uuid(),
  playerName: z.string(),
  championships: z.array(ChampionshipWinnersInfoSchema),
});

export const ChampionshipWinnersResponseSchema = z.array(
  ChampionshipWinnersSchema,
);

export type ChampionshipWinnersResponseDto = z.infer<
  typeof ChampionshipWinnersResponseSchema
>;
