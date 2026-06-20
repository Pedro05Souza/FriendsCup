import { Controller, Get, Param } from '@nestjs/common';
import { H2HMatchDetailDto } from 'src/application/dtos/h2h-match-detail.dto';
import { MatchHistoryDto } from 'src/application/dtos/get-match-history.dto';
import { RivalryDto } from 'src/application/dtos/rivalry.dto';
import { GetH2HMatchDetailUsecase } from 'src/application/usecases/get-h2h-match-detail.usecase';
import { GetMatchHistoryForPlayersUsecase } from 'src/application/usecases/get-match-history-for-players.usecase';
import { GetRivalriesUsecase } from 'src/application/usecases/get-rivalries.usecase';

@Controller('/matches')
export class MatchController {
  constructor(
    private readonly _getMatchHistoryForPlayersUsecase: GetMatchHistoryForPlayersUsecase,
    private readonly _getRivalriesUsecase: GetRivalriesUsecase,
    private readonly _getH2HMatchDetailUsecase: GetH2HMatchDetailUsecase,
  ) {}

  @Get('/rivalries')
  async getRivalries(): Promise<RivalryDto[]> {
    return this._getRivalriesUsecase.getTopRivalries();
  }

  @Get('/history/:playerId/:opponentId/details')
  async getMatchHistoryDetail(
    @Param('playerId') playerId: string,
    @Param('opponentId') opponentId: string,
  ): Promise<H2HMatchDetailDto> {
    return this._getH2HMatchDetailUsecase.getDetail(playerId, opponentId);
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
