import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';
import { duoDtoSchema } from './duo.dto';
import { matchDtoSchema } from './match.dto';
import { championshipGroupDtoSchema } from './championship-group.dto';

const playerChampionshipDtoSchema = playerDtoSchema
  .omit({
    overrallRating: true,
    intelligence: true,
    defense: true,
    attack: true,
    mentality: true,
  })
  .extend({
    overallRating: z.number().optional(),
  });

export const championshipDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAtIso: z.string().datetime(),
  championshipWinnerId: z.string().optional(),
  championshipWinnerName: z.string().optional(),
  players: z.array(playerChampionshipDtoSchema),
  groups: z.array(championshipGroupDtoSchema).optional(),
  duos: z.array(duoDtoSchema).optional(),
  matches: z.array(matchDtoSchema),
});

export class ChampionshipDto extends createZodDto(championshipDtoSchema) {}
