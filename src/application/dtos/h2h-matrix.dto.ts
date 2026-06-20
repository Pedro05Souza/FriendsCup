import { z } from 'zod';

const recordSchema = z.object({
  wins: z.number().int(),
  draws: z.number().int(),
  losses: z.number().int(),
});

export const h2hMatrixDtoSchema = z.object({
  players: z.array(z.object({ id: z.string(), name: z.string() })),
  results: z.record(z.string(), z.record(z.string(), recordSchema)),
});

export type H2HMatrixDto = z.infer<typeof h2hMatrixDtoSchema>;
