import { z } from 'zod';
import { createMatchDtoSchema } from './create-match.dto';
import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';
import { duoDtoSchema } from './duo.dto';

export const matchDtoSchema = createMatchDtoSchema
  .extend({
    id: z.string(),
  })
  .omit({
    player1Id: true,
    player2Id: true,
    duo1Id: true,
    duo2Id: true,
  })
  .extend({
    player1: playerDtoSchema.optional(),
    player2: playerDtoSchema.optional(),
    duo1: duoDtoSchema.optional(),
    duo2: duoDtoSchema.optional(),
  });

export class MatchDto extends createZodDto(matchDtoSchema) {}
