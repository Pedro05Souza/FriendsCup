import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createMatchDtoSchema = z.object({
  player1Id: z.string().optional(),
  player2Id: z.string().optional(),
  duo1Id: z.string().optional(),
  duo2Id: z.string().optional(),
  player1Goals: z.number(),
  player2Goals: z.number(),
  matchPhase: z.string(),
  isPenaltyShootout: z.boolean(),
  player1PenaltyShootout: z.number().optional(),
  player2PenaltyShootout: z.number().optional(),
});

export class CreateMatchDto extends createZodDto(createMatchDtoSchema) {}
