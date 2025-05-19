import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createPlayerDto = z.object({
  name: z.string(),
});

export class CreatePlayerDto extends createZodDto(createPlayerDto) {}
