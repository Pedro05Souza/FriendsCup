import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { tournamentNameEnum } from './enums';

export const createChampionshipSchema = z.object({
  title: tournamentNameEnum,
  createdAtIso: z.string().date(),
});

export class CreateChampionshipDto extends createZodDto(
  createChampionshipSchema,
) {}
