import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createDuoDtoSchema = z.object({
  player1Id: z.string().uuid(),
  player2Id: z.string().uuid(),
});

export class CreateDuoDto extends createZodDto(createDuoDtoSchema) {}
