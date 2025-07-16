import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const matchParticipantSchema = z.object({
  id: z.string(),
  goals: z.number(),
  penaltyShootoutGoals: z.number().optional(),
});

export const createMatchDtoSchema = z.object({
  participants: z.array(matchParticipantSchema).length(2),
  matchPhase: z.string(),
});

export class CreateMatchDto extends createZodDto(createMatchDtoSchema) {}
