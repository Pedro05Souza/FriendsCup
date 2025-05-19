import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const playerDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
});

export class PlayerDto extends createZodDto(playerDtoSchema) {}
