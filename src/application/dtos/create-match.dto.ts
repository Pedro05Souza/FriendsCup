import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { matchPhaseEnum } from './enums';

export const matchParticipantSchema = z.object({
  id: z.string(),
  goals: z.number(),
  penaltyShootoutGoals: z.number().optional(),
});

export const createMatchDtoSchema = z.object({
  participants: z.array(matchParticipantSchema).length(2),
  matchPhase: matchPhaseEnum,
  groupId: z.string().optional(),
});

export class CreateMatchDto extends createZodDto(createMatchDtoSchema) {}
