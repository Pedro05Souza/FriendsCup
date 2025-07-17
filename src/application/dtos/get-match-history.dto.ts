import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const matchHistoryDto = z.object({
  matchesPlayed: z.number().int(),
  matchesWon: z.number().int(),
  matchesLost: z.number().int(),
  matchesDrawn: z.number().int(),
  winRate: z.number().min(0).max(100),
  biggestLossDifference: z.number().int(),
  biggestWinDifference: z.number().int(),
  goalsScored: z.number().int(),
  goalsConceded: z.number().int(),
});

export class MatchHistoryDto extends createZodDto(matchHistoryDto) {}
