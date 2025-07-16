import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createDuoDtoSchema = z.object({
  player1Id: z.string().uuid(),
  player2Id: z.string().uuid(),
  name: z
    .string()
    .min(1, 'Duo name is required')
    .max(100, 'Duo name must be less than 100 characters')
    .optional(),
});

export class CreateDuoDto extends createZodDto(createDuoDtoSchema) {}
