import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CreatePlayerDto } from '../../application/dtos/create-player.dto';
import { CreatePlayerUsecase } from 'src/application/usecases/create-player.usecase';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { DeletePlayerUsecase } from 'src/application/usecases/delete-player.usecase';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly _createPlayerUsecase: CreatePlayerUsecase,
    private readonly _deletePlayerUsecase: DeletePlayerUsecase,
  ) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto): Promise<PlayerDto> {
    return await this._createPlayerUsecase.createPlayer(createPlayerDto);
  }

  @Delete('/:id')
  async delete(@Param(':id') id: string): Promise<void> {
    return await this._deletePlayerUsecase.deletePlayer(id);
  }
}
