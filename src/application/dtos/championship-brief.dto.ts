import { z } from 'zod';

export const championshipBriefDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAtIso: z.string().datetime(),
  isDuo: z.boolean(),
  matchCount: z.number().int(),
  winnerName: z.string().nullable(),
});

export type ChampionshipBriefDto = z.infer<typeof championshipBriefDtoSchema>;
