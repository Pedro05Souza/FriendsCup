import { z } from 'zod';
import {
  createMatchDtoSchema,
  matchParticipantSchema,
} from './create-match.dto';
import { createZodDto } from 'nestjs-zod';

const extendedParticipantSchema = matchParticipantSchema.extend({
  name: z.string(),
});

export const matchDtoSchema = createMatchDtoSchema
  .omit({
    participants: true,
  })
  .extend({
    id: z.string(),
    winnerId: z.string().nullable(),
    winnerName: z.string().nullable(),
    participants: z.array(extendedParticipantSchema),
  });

export class MatchDto extends createZodDto(matchDtoSchema) {}
