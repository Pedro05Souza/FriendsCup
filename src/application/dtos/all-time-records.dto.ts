import { z } from 'zod';

const recordHolderSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  value: z.number(),
});

const matchRecordSchema = z.object({
  playerName: z.string(),
  opponentName: z.string().optional(),
  value: z.number(),
  scoreline: z.string().optional(),
  championship: z.string(),
  phase: z.string(),
});

export const allTimeRecordsDtoSchema = z.object({
  topScorer: recordHolderSchema.nullable(),
  mostMatchesPlayed: recordHolderSchema.nullable(),
  mostTitles: recordHolderSchema.nullable(),
  highestWinRate: z
    .object({
      playerId: z.string(),
      playerName: z.string(),
      winRate: z.number(),
      matchesPlayed: z.number().int(),
    })
    .nullable(),
  biggestWin: matchRecordSchema.nullable(),
  mostGoalsInOneMatch: matchRecordSchema.nullable(),
});

export type AllTimeRecordsDto = z.infer<typeof allTimeRecordsDtoSchema>;
