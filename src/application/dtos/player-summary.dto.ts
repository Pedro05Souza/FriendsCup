import { z } from 'zod';
import { matchPhaseEnum } from './enums';

/**
 * How far a player got in one cup.
 * ELIMINATED carries the deepest phase they reached in `phase`.
 */
export const cupFinishSchema = z.enum([
  'CHAMPION',
  'RUNNER_UP',
  'FINALIST',
  'THIRD',
  'FOURTH',
  'ELIMINATED',
  'NOT_STARTED',
]);

export const playerSummaryCupSchema = z.object({
  championshipId: z.string(),
  title: z.string(),
  createdAtIso: z.string(),
  isDuo: z.boolean(),
  matchesPlayed: z.number().int(),
  goals: z.number().int(),
  finish: cupFinishSchema,
  /** Deepest phase reached, set when finish is ELIMINATED. */
  phase: matchPhaseEnum.nullable(),
  /** 0 for champion; higher means knocked out earlier. Useful for sorting. */
  finishRank: z.number().int(),
  playedFinal: z.boolean(),
  wonFinal: z.boolean(),
  goldenBoot: z.boolean(),
});

export const playerSummaryOpponentSchema = z.object({
  opponentId: z.string(),
  opponentName: z.string(),
  matchesPlayed: z.number().int(),
  wins: z.number().int(),
  draws: z.number().int(),
  losses: z.number().int(),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
});

export const playerSummaryDtoSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  cupsEntered: z.number().int(),
  finalsPlayed: z.number().int(),
  finalsWon: z.number().int(),
  goldenBoots: z.number().int(),
  /** Best cup run, or null if the player hasn't entered a cup. */
  bestFinish: playerSummaryCupSchema.nullable(),
  /** Newest cup first. */
  cups: z.array(playerSummaryCupSchema),
  /** 1v1 record against each opponent, most-played first. */
  opponents: z.array(playerSummaryOpponentSchema),
});

export type CupFinish = z.infer<typeof cupFinishSchema>;
export type PlayerSummaryCupDto = z.infer<typeof playerSummaryCupSchema>;
export type PlayerSummaryOpponentDto = z.infer<
  typeof playerSummaryOpponentSchema
>;
export type PlayerSummaryDto = z.infer<typeof playerSummaryDtoSchema>;
