import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';


export const createPlayerDto = z.object({
  name: z.string(),
  intelligence: z.number().int().min(0).max(100),
  defense: z.number().int().min(0).max(100),
  attack: z.number().int().min(0).max(100),
  mentality: z.number().int().min(0).max(100),
});

export class CreatePlayerDto extends createZodDto(createPlayerDto) {
}
