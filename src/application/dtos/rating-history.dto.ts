import { z } from 'zod';

const ratingScaleEnum = z.enum(['LEGACY_5', 'POINTS_100']);

export const ratingPointSchema = z.object({
  championshipId: z.string().nullable(),
  championshipTitle: z.string().nullable(),
  takenAtIso: z.string(),
  scale: ratingScaleEnum,
  /** As originally given: 1-5 for LEGACY_5, 0-100 otherwise. */
  rawOverall: z.number(),
  /** Always 0-100 (converted for LEGACY_5). */
  overall: z.number().int(),
  attack: z.number().int().nullable(),
  defense: z.number().int().nullable(),
  intelligence: z.number().int().nullable(),
  mentality: z.number().int().nullable(),
});

export const ratingHistoryDtoSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  /** Ratings after each cup, oldest first. */
  snapshots: z.array(ratingPointSchema),
  /** The player's rating right now. */
  current: z.object({
    overall: z.number().int(),
    attack: z.number().int(),
    defense: z.number().int(),
    intelligence: z.number().int(),
    mentality: z.number().int(),
  }),
});

export const ratingChangeSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  before: ratingPointSchema,
  after: ratingPointSchema,
  /** Change on the 0-100 scale. */
  delta: z.number().int(),
  /** Change on the original scale, when both ratings use the same one. */
  rawDelta: z.number().nullable(),
});

export const championshipRatingChangesDtoSchema = z.object({
  championshipId: z.string(),
  /** Whether ratings were saved for this cup. */
  saved: z.boolean(),
  /** Only the latest cup can have ratings saved, since they're today's ratings. */
  canSave: z.boolean(),
  /** Players rated after this cup who had an earlier rating, biggest rise first. */
  changes: z.array(ratingChangeSchema),
  /** Players rated for the first time after this cup. */
  firstRatings: z.array(
    z.object({
      playerId: z.string(),
      playerName: z.string(),
      after: ratingPointSchema,
    }),
  ),
});

export type RatingPointDto = z.infer<typeof ratingPointSchema>;
export type RatingHistoryDto = z.infer<typeof ratingHistoryDtoSchema>;
export type RatingChangeDto = z.infer<typeof ratingChangeSchema>;
export type ChampionshipRatingChangesDto = z.infer<
  typeof championshipRatingChangesDtoSchema
>;
