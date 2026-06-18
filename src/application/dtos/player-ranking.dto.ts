import { z } from 'zod';

export const playerRankingDtoSchema = z.object({
  rank: z.number().int(),
  playerId: z.string(),
  playerName: z.string(),
  overallRating: z.number(),
  matchesPlayed: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  draws: z.number().int(),
  winRate: z.number(),
  goalsScored: z.number().int(),
  avgGoalsPerMatch: z.number(),
  titlesWon: z.number().int(),
  titlesByChampionship: z.record(z.string(), z.number()),
  rankingScore: z.number(),
});

export type PlayerRankingDto = z.infer<typeof playerRankingDtoSchema>;
