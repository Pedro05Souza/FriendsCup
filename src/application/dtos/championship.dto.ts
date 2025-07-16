import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';
import { duoDtoSchema } from './duo.dto';
import { matchDtoSchema } from './match.dto';

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
  matches: z.array(matchDtoSchema),
  players: z.array(playerChampionshipDtoSchema),
  duos: z.array(duoDtoSchema).optional(),
});

export class ChampionshipDto extends createZodDto(championshipDtoSchema) {}
