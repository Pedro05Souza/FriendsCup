import { createZodDto } from 'nestjs-zod';
import { createPlayerDto } from './create-player.dto';

export const updatePlayerDto = createPlayerDto.omit({
  name: true,
});

export class UpdatePlayerDto extends createZodDto(updatePlayerDto) {}
