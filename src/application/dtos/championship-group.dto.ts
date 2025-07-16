import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const championshipGroupDtoSchema = z.object({
  id: z.string(),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      points: z.number(),
      goalDifference: z.number(),
    }),
  ),
});

export class ChampionshipGroupDto extends createZodDto(
  championshipGroupDtoSchema,
) {}
