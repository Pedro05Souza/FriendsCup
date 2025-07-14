import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';
import { z } from 'zod';

export const listPlayersSchemaResponse = z.object({
  players: z.array(playerDtoSchema),
  hasMore: z.boolean(),
});

export class listPlayersDto extends createZodDto(listPlayersSchemaResponse) {}
