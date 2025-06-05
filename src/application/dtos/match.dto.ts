import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { playerDtoSchema } from './player.dto';

export const matchDtoSchema = z.object({
    player1: playerDtoSchema,
    player2: playerDtoSchema,
    playerGoal1: z.number(),
    playerGoal2: z.number(),
    matchPhase: z.string(),
    isPenaltyShootout: z.boolean(),
    penaltyShootoutPlayer1: z.number().optional(),
    penaltyShootoutPlayer2: z.number().optional(),
});

export class MatchDto extends createZodDto(matchDtoSchema) {}