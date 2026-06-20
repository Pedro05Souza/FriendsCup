import { z } from 'zod';

export const playerFormEntrySchema = z.object({
  result: z.enum(['W', 'D', 'L']),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
  opponentName: z.string(),
  championship: z.string(),
  phase: z.string(),
  decidedByPenalties: z.boolean(),
});

export const playerFormDtoSchema = z.array(playerFormEntrySchema);

export type PlayerFormDto = z.infer<typeof playerFormDtoSchema>;
