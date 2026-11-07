import { createZodDto } from 'nestjs-zod';
import { createMatchDtoSchema } from './create-match.dto';

/** Same shape as creating a match: the full corrected result replaces the old one. */
export const updateMatchDtoSchema = createMatchDtoSchema;

export class UpdateMatchDto extends createZodDto(updateMatchDtoSchema) {}
