import { z  } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { matchDtoSchema } from './match.dto';
import { playerDtoSchema } from './player.dto';

export const championshipDtoSchema = z.object({
    id: z.string(),
    title: z.string(),
    createdAtIso: z.string().datetime(),
    matches: z.array(matchDtoSchema),
    players: z.array(playerDtoSchema),
});

export class ChampionshipDto extends createZodDto(championshipDtoSchema) {}