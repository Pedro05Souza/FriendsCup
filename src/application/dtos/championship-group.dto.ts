import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const championshipPlayerGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  points: z.number(),
  goalDifference: z.number(),
});

export const championshipGroupDtoSchema = z.object({
  id: z.string(),
  players: z.array(championshipPlayerGroupSchema),
});

export class ChampionshipGroupDto extends createZodDto(
  championshipGroupDtoSchema,
) {}
