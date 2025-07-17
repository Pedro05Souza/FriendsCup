import { z } from 'zod';

export const matchPhaseEnum = z.enum([
  'GROUP_STAGE',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMIFINALS',
  'THIRD_PLACE',
  'FINALS',
]);

export const tournamentNameEnum = z.enum([
  'COPA NABOR',
  'COPA CHILELA',
  'COPA DOUGLAS',
  'COPA DEIVES',
  'COPA POLAR',
]);
