import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { createPlayerDto } from './create-player.dto';

export const playerDtoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    overrallRating: z.number().int().min(0).max(100),
  })
  .extend(createPlayerDto.shape);

export class PlayerDto extends createZodDto(playerDtoSchema) {}
