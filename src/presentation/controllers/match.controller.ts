import { Controller, Get, Param } from '@nestjs/common';
import { MatchHistoryDto } from 'src/application/dtos/get-match-history.dto';
import { RivalryDto } from 'src/application/dtos/rivalry.dto';
import { GetMatchHistoryForPlayersUsecase } from 'src/application/usecases/get-match-history-for-players.usecase';
import { GetRivalriesUsecase } from 'src/application/usecases/get-rivalries.usecase';

@Controller('/matches')
export class MatchController {
  constructor(
    private readonly _getMatchHistoryForPlayersUsecase: GetMatchHistoryForPlayersUsecase,
    private readonly _getRivalriesUsecase: GetRivalriesUsecase,
  ) {}

  @Get('/rivalries')
  async getRivalries(): Promise<RivalryDto[]> {
    return this._getRivalriesUsecase.getTopRivalries();
  }

  @Get('/history/:playerId/:opponentId')
  async getMatchHistoryForPlayers(
    @Param('playerId') playerId: string,
    @Param('opponentId') opponentId: string,
  ): Promise<MatchHistoryDto> {
    return this._getMatchHistoryForPlayersUsecase.getMatchHistoryForPlayers(
      playerId,
      opponentId,
    );
  }
}
