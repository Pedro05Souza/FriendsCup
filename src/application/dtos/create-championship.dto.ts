import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createChampionshipSchema = z.object({
    title: z.string(),
    createdAtIso: z.string().datetime(),
});

export class CreateChampionshipDto extends createZodDto(createChampionshipSchema) {
}