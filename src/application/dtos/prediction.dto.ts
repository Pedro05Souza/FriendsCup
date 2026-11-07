import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const predictedSideSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  /** 1v1 matches behind this player's ratings; few means close to average. */
  matchesInModel: z.number().int(),
  expectedGoals: z.number(),
  winProbability: z.number(),
});

export const matchPredictionDtoSchema = z.object({
  player: predictedSideSchema,
  opponent: predictedSideSchema,
  drawProbability: z.number(),
  /** The most likely exact scores, most likely first (player's goals first). */
  likelyScores: z.array(
    z.object({
      player: z.number().int(),
      opponent: z.number().int(),
      probability: z.number(),
    }),
  ),
  /** P(player scores i, opponent scores j) for i, j in 0..6. */
  scoreMatrix: z.array(z.array(z.number())),
});

export const powerRatingSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  matchesInModel: z.number().int(),
  /** Goals expected against a league-average opponent. */
  attack: z.number(),
  /** Goals expected to concede against a league-average opponent. */
  defence: z.number(),
  /** attack − defence: expected goal difference against an average opponent. */
  strength: z.number(),
});

export const powerRatingsDtoSchema = z.object({
  /** 1v1 matches the model is fitted on. */
  matchesUsed: z.number().int(),
  /** A match's weight halves every this many years. */
  halfLifeYears: z.number(),
  ratings: z.array(powerRatingSchema),
});

export const cupFormatEnum = z.enum(['KNOCKOUT', 'GROUPS_AND_KNOCKOUT']);

export const simulateCupDtoSchema = z.object({
  playerIds: z
    .array(z.string())
    .min(2)
    .max(32)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Players must be different',
    ),
  format: cupFormatEnum,
  simulations: z.number().int().min(1000).max(50000).default(10000),
  /** Same seed and inputs give the same result. Random when omitted. */
  seed: z.number().int().optional(),
});

export class SimulateCupDto extends createZodDto(simulateCupDtoSchema) {}

export const cupSimulationDtoSchema = z.object({
  format: cupFormatEnum,
  simulations: z.number().int(),
  seed: z.number().int(),
  odds: z.array(
    z.object({
      playerId: z.string(),
      playerName: z.string(),
      matchesInModel: z.number().int(),
      title: z.number(),
      final: z.number(),
      semifinal: z.number(),
      knockout: z.number(),
    }),
  ),
});

export type MatchPredictionDto = z.infer<typeof matchPredictionDtoSchema>;
export type PowerRatingsDto = z.infer<typeof powerRatingsDtoSchema>;
export type CupSimulationDto = z.infer<typeof cupSimulationDtoSchema>;
