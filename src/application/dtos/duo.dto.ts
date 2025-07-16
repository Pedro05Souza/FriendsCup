import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';

export const duoDtoSchema = z.object({
  player1: playerDtoSchema,
  player2: playerDtoSchema,
});

export class CreateDuoDto extends createZodDto(duoDtoSchema) {}
