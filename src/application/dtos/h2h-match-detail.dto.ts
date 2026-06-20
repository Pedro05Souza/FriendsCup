import { z } from 'zod';

export const h2hMatchDetailSchema = z.object({
  championship: z.string(),
  year: z.number().int(),
  phase: z.string(),
  goalsP1: z.number().int(),
  goalsP2: z.number().int(),
  result: z.enum(['W', 'D', 'L']),
});

export const h2hMatchDetailDtoSchema = z.array(h2hMatchDetailSchema);

export type H2HMatchDetailDto = z.infer<typeof h2hMatchDetailDtoSchema>;
