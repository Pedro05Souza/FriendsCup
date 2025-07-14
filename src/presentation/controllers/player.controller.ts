import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CreatePlayerDto } from '../../application/dtos/create-player.dto';
import { UpdatePlayerDto } from 'src/application/dtos/update-player.dto';
import { CreatePlayerUsecase } from 'src/application/usecases/create-player.usecase';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { DeletePlayerUsecase } from 'src/application/usecases/delete-player.usecase';
import { UpdatePlayerUsecase } from 'src/application/usecases/update-player.usecase';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly _createPlayerUsecase: CreatePlayerUsecase,
    private readonly _deletePlayerUsecase: DeletePlayerUsecase,
    private readonly _updatePlayerUsecase: UpdatePlayerUsecase
  ) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto): Promise<PlayerDto> {
    return await this._createPlayerUsecase.createPlayer(createPlayerDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this._deletePlayerUsecase.deletePlayer(id);
  }

  @Post('/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerDto> {
    return await this._updatePlayerUsecase.updatePlayer(id, updatePlayerDto);
  }
}
