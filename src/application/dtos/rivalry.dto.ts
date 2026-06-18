import { z } from 'zod';

export const rivalryDtoSchema = z.object({
  player1Id: z.string(),
  player1Name: z.string(),
  player2Id: z.string(),
  player2Name: z.string(),
  matchesPlayed: z.number().int(),
  player1Wins: z.number().int(),
  player2Wins: z.number().int(),
  draws: z.number().int(),
  player1Goals: z.number().int(),
  player2Goals: z.number().int(),
});

export type RivalryDto = z.infer<typeof rivalryDtoSchema>;
