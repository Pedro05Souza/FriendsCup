import { Controller, Get, Param } from '@nestjs/common';
import { MatchHistoryDto } from 'src/application/dtos/get-match-history.dto';
import { GetMatchHistoryForPlayersUsecase } from 'src/application/usecases/get-match-history-for-players.usecase';

@Controller('/matches')
export class MatchController {
  constructor(
    private readonly _getMatchHistoryForPlayersUsecase: GetMatchHistoryForPlayersUsecase,
  ) {}

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
