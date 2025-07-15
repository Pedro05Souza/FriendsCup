import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';
import { duoDtoSchema } from './duo.dto';
import { matchDtoSchema } from './match.dto';

export const championshipDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAtIso: z.string().datetime(),
  matches: z.array(matchDtoSchema),
  players: z.array(playerDtoSchema).optional(),
  duos: z.array(duoDtoSchema).optional(),
});

export class ChampionshipDto extends createZodDto(championshipDtoSchema) {}
