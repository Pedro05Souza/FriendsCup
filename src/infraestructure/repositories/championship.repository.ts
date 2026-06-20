import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import {
  AllTimeRecordsData,
  ChampionshipRepository,
  ChampionshipWinners,
  CreateChampionshipParams,
  CreateChampionshipParticipantParams,
  CreateDuoParams,
  CreateGroupEntityParams,
  CreateMatchParticipant,
  H2HMatchDetailData,
  PlayerFormData,
  RivalryData,
} from '../../domain/interfaces/championship.interface';
import { mapToChampionshipEntity } from './mappers/championship.mapper';
import {
  ChampionshipBriefEntity,
  ChampionshipEntity,
  CompleteChampionshipEntity,
} from 'src/domain/entities/championship.entity';
import { playerModelToEntity } from './mappers/player.mapper';
import { PrismaClientService } from 'src/application/services/prisma-client';
import {
  DuoEntity,
  GroupDuoEntity,
  GroupPlayerEntity,
  PlayerEntity,
} from 'src/domain/entities/player.entity';
import { GroupEntity } from 'src/domain/entities/group.entity';
import {
  mapToGroupEntity,
  mapToGroupParticipant,
} from './mappers/group.mapper';
import { MatchEntity } from 'src/domain/entities/match.entity';
import { MatchPhase } from 'src/domain/constants';
import { mapToMatchEntity } from './mappers/match.mapper';

interface PlayerData {
  id: string;
  createdAt: Date;
  name: string;
  intelligence: number;
  defense: number;
  attack: number;
  mentality: number;
}

type DuoData = {
  player1: PlayerData;
  player2: PlayerData;
} & {
  id: string;
  championshipId: string;
  player1Id: string;
  player2Id: string;
  name: string;
};

export type GroupPlayerData = {
  player: PlayerData | null;
  duo: DuoData | null;
} & {
  id: string;
  playerId: string | null;
  duoId: string | null;
  championshipGroupId: string;
  points: number;
  goalDifference: number;
};

export type ChampionshipGroupData = {
  groupPlayers: GroupPlayerData[];
} & {
  id: string;
  createdAt: Date;
  championshipId: string;
};

export type MatchData = {
  participants: Array<{
    id: string;
    penaltyShootoutGoals: number | null;
    goals: number;
    playerId?: string | null;
    duoId?: string | null;
  }>;
} & {
  id: string;
  championshipId: string;
  matchPhase: string;
  winnerId: string | null;
  duoWinnerId: string | null;
};

export type ChampionshipData = {
  matches: Array<{
    id: string;
  }>;
  players: Array<{
    id: string;
  }>;
  duos: Array<{
    id: string;
  }>;
  groups: Array<{
    id: string;
  }>;
} & {
  id: string;
  title: string;
  createdAt: Date;
  isDuo: boolean;
  winnerId?: string | null;
  duoWinnerId?: string | null;
};

@Injectable()
export class ChampionshipRepositoryImpl implements ChampionshipRepository {
  constructor(private readonly _prismaService: PrismaClientService) {}

  async createChampionship(params: CreateChampionshipParams): Promise<void> {
    await this._prismaService.championship.create({
      data: {
        title: params.title,
        createdAt: params.createdAt.toJSDate(),
        isDuo: params.isDuo,
      },
    });
  }

  async updateChampionshipWinner(
    championshipId: string,
    winnerId?: string,
    duoWinnerId?: string,
  ): Promise<void> {
    await this._prismaService.championship.update({
      where: { id: championshipId },
      data: {
        winnerId,
        duoWinnerId,
      },
    });
  }

  async createDuo(params: CreateDuoParams): Promise<DuoEntity> {
    const duo = await this._prismaService.duo.create({
      data: {
        player1Id: params.player1Id,
        player2Id: params.player2Id,
        championshipId: params.championshipId,
        name: params.name,
      },
      include: {
        player1: true,
        player2: true,
      },
    });

    return {
      id: duo.id,
      player1: playerModelToEntity(duo.player1),
      player2: playerModelToEntity(duo.player2),
      name: duo.name,
    };
  }

  async findChampionshipById(id: string): Promise<ChampionshipEntity | null> {
    const championship = await this._prismaService.championship.findUnique({
      where: { id },
      include: {
        matches: {
          select: {
            id: true,
          },
        },
        players: {
          select: {
            id: true,
          },
        },
        duos: {
          select: {
            id: true,
          },
        },
        groups: {
          select: {
            id: true,
          },
        },
      },
    });

    if (championship === null) {
      return null;
    }

    return mapToChampionshipEntity(championship);
  }

  async createMatch(
    championshipId: string,
    matchPhase: MatchPhase,
    winnerId?: string,
    duoWinnerId?: string,
  ): Promise<MatchEntity> {
    const match = await this._prismaService.match.create({
      data: {
        championshipId,
        matchPhase,
        winnerId,
        duoWinnerId,
      },
      include: {
        participants: {
          select: {
            id: true,
            penaltyShootoutGoals: true,
            goals: true,
            playerId: true,
            duoId: true,
          },
        },
      },
    });

    return mapToMatchEntity(match);
  }

  async getDuoPlayersById(duoId: string): Promise<DuoEntity | null> {
    const duo = await this._prismaService.duo.findUnique({
      where: { id: duoId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (duo === null) {
      return null;
    }

    return {
      id: duo.id,
      player1: playerModelToEntity(duo.player1),
      player2: playerModelToEntity(duo.player2),
      name: duo.name,
    };
  }

  async getGroupById(groupId: string): Promise<GroupEntity | null> {
    const group = await this._prismaService.championshipGroup.findUnique({
      where: { id: groupId },
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    if (group === null) {
      return null;
    }

    return mapToGroupEntity(group);
  }

  async createChampionshipGroup(championshipId: string): Promise<GroupEntity> {
    const group = await this._prismaService.championshipGroup.create({
      data: {
        championshipId,
      },
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    return mapToGroupEntity(group);
  }

  async getGroupByParticipantId(
    participantId: string,
    championshipId?: string,
  ): Promise<GroupEntity | null> {
    const whereClause: {
      groupPlayers: {
        some: {
          OR: Array<{ playerId: string } | { duoId: string }>;
        };
      };
      championshipId?: string;
    } = {
      groupPlayers: {
        some: {
          OR: [{ playerId: participantId }, { duoId: participantId }],
        },
      },
    };

    if (championshipId) {
      whereClause.championshipId = championshipId;
    }

    const group = await this._prismaService.championshipGroup.findFirst({
      where: whereClause,
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    if (group === null) {
      return null;
    }

    return mapToGroupEntity(group);
  }

  async updateGroupParticipant(
    groupParticipant: GroupPlayerEntity | GroupDuoEntity,
  ): Promise<void> {
    await this._prismaService.groupPlayer.update({
      where: {
        id: groupParticipant.groupPlayerId,
      },
      data: {
        points: groupParticipant.points,
        goalDifference: groupParticipant.goalDifference,
      },
    });
  }

  async createGroupParticipant(
    params: CreateGroupEntityParams,
  ): Promise<GroupPlayerEntity | GroupDuoEntity> {
    const groupPlayer = await this._prismaService.groupPlayer.create({
      data: {
        points: params.points,
        goalDifference: params.goalDifference,
        championshipGroupId: params.championshipGroupId,
        playerId: params.playerId,
        duoId: params.duoId,
      },
      include: {
        player: true,
        duo: {
          include: {
            player1: true,
            player2: true,
          },
        },
      },
    });

    return mapToGroupParticipant(groupPlayer);
  }

  async createMatchParticipant(
    matchParticipant: CreateMatchParticipant,
  ): Promise<void> {
    await this._prismaService.matchParticipant.create({
      data: {
        matchId: matchParticipant.matchId,
        playerId: matchParticipant.playerId,
        duoId: matchParticipant.duoId,
        goals: matchParticipant.goals,
        penaltyShootoutGoals: matchParticipant.penaltyShootoutGoals,
      },
    });
  }

  async getMatchesByIds(matchIds: string[]): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        id: { in: matchIds },
      },
      include: {
        participants: {
          select: {
            id: true,
            penaltyShootoutGoals: true,
            goals: true,
            playerId: true,
            duoId: true,
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }

  async findParticipantsByChampionshipId(
    championshipId: string,
  ): Promise<Array<DuoEntity | PlayerEntity>> {
    const championship = await this._prismaService.championship.findUnique({
      where: { id: championshipId },
      include: {
        duos: {
          include: {
            player1: true,
            player2: true,
          },
        },
        players: true,
      },
    });

    if (championship === null) {
      return [];
    }

    if (championship.duos.length > 0) {
      return championship.duos.map((duo) => ({
        id: duo.id,
        player1: playerModelToEntity(duo.player1),
        player2: playerModelToEntity(duo.player2),
        name: duo.name,
      }));
    }

    if (championship.players.length > 0) {
      return championship.players.map((player) => playerModelToEntity(player));
    }

    return [];
  }

  async bulkCreateParticipantsForChampionship(
    params: CreateChampionshipParticipantParams,
  ): Promise<void> {
    await this._prismaService.championship.update({
      where: { id: params.championshipId },
      data: {
        ...(params.playerIds && {
          players: {
            connect: params.playerIds.map((id) => ({ id })),
          },
        }),
        ...(params.duoIds && {
          duos: {
            connect: params.duoIds.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async getGroupsByIds(groupIds: string[]): Promise<GroupEntity[]> {
    const groups = await this._prismaService.championshipGroup.findMany({
      where: {
        id: { in: groupIds },
      },
      include: {
        groupPlayers: {
          include: {
            player: true,
            duo: {
              include: {
                player1: true,
                player2: true,
              },
            },
          },
        },
      },
    });

    return groups.map(mapToGroupEntity);
  }

  async getMatchHistoryForPlayers(
    playerId: string,
    opponentId: string,
  ): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        AND: [
          {
            participants: {
              some: {
                OR: [{ playerId }, { duoId: playerId }],
              },
            },
          },
          {
            participants: {
              some: {
                OR: [{ playerId: opponentId }, { duoId: opponentId }],
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            penaltyShootoutGoals: true,
            goals: true,
            playerId: true,
            duoId: true,
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }

  async getChampionshipWinners(): Promise<ChampionshipWinners[]> {
    const championships = await this._prismaService.championship.findMany({
      where: {
        OR: [{ winnerId: { not: null } }, { duoWinnerId: { not: null } }],
      },
      include: {
        winner: true,
        duoWinner: {
          include: {
            player1: true,
            player2: true,
          },
        },
      },
    });

    const playerWinsMap = new Map<
      string,
      {
        playerName: string;
        championships: Map<string, number>;
      }
    >();

    championships.forEach((championship) => {
      if (championship.winner) {
        const playerId = championship.winner.id;
        if (!playerWinsMap.has(playerId)) {
          playerWinsMap.set(playerId, {
            playerName: championship.winner.name,
            championships: new Map(),
          });
        }

        const playerData = playerWinsMap.get(playerId)!;
        const currentCount =
          playerData.championships.get(championship.title) ?? 0;
        playerData.championships.set(championship.title, currentCount + 1);
      }

      if (championship.duoWinner) {
        const uniquePlayers =
          championship.duoWinner.player1.id ===
          championship.duoWinner.player2.id
            ? [championship.duoWinner.player1]
            : [championship.duoWinner.player1, championship.duoWinner.player2];

        uniquePlayers.forEach((player) => {
          const playerId = player.id;
          if (!playerWinsMap.has(playerId)) {
            playerWinsMap.set(playerId, {
              playerName: player.name,
              championships: new Map(),
            });
          }

          const playerData = playerWinsMap.get(playerId)!;
          const currentCount =
            playerData.championships.get(championship.title) ?? 0;
          playerData.championships.set(championship.title, currentCount + 1);
        });
      }
    });

    return Array.from(playerWinsMap.entries()).map(([playerId, data]) => ({
      playerId,
      playerName: data.playerName,
      championships: Array.from(data.championships.entries()).map(
        ([championshipName, timesWon]) => ({
          championshipName,
          timesWon,
        }),
      ),
    }));
  }

  async getAllChampionshipsByYear(
    year: string,
  ): Promise<CompleteChampionshipEntity[]> {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const championships = await this._prismaService.championship.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        matches: {
          include: {
            participants: {
              select: {
                id: true,
                penaltyShootoutGoals: true,
                goals: true,
                playerId: true,
                duoId: true,
              },
            },
          },
        },
        players: true,
        duos: {
          include: {
            player1: true,
            player2: true,
          },
        },
      },
    });

    return championships.map((championship) => ({
      id: championship.id,
      title: championship.title,
      createdAt: DateTime.fromJSDate(championship.createdAt),
      isDuo: championship.isDuo,
      winnerId: championship.winnerId ?? championship.duoWinnerId ?? undefined,
      matches: championship.matches.map(mapToMatchEntity),
      participants: championship.isDuo
        ? championship.duos.map((duo) => ({
            id: duo.id,
            player1: playerModelToEntity(duo.player1),
            player2: playerModelToEntity(duo.player2),
            name: duo.name,
          }))
        : championship.players.map((player) => playerModelToEntity(player)),
    }));
  }

  async getAllMatchesWonByPlayerId(playerId: string): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        OR: [
          { winnerId: playerId },
          {
            AND: [
              { duoWinnerId: { not: null } },
              {
                duoWinner: {
                  OR: [{ player1Id: playerId }, { player2Id: playerId }],
                },
              },
            ],
          },
        ],
      },
      include: {
        participants: {
          where: {
            OR: [
              { playerId: playerId },
              {
                duo: {
                  OR: [{ player1Id: playerId }, { player2Id: playerId }],
                },
              },
            ],
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }

  async getAllMatchesLostByPlayerId(playerId: string): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        // Player participated (solo or duo)
        participants: {
          some: {
            OR: [
              { playerId },
              {
                duo: {
                  OR: [{ player1Id: playerId }, { player2Id: playerId }],
                },
              },
            ],
          },
        },

        // Player lost (solo OR duo)
        OR: [
          // ---- SOLO LOSS ----
          {
            winnerId: {
              not: playerId,
            },
            duoWinnerId: null,
          },

          // ---- DUO LOSS ----
          {
            duoWinnerId: {
              not: null,
            },
            duoWinner: {
              AND: [
                { player1Id: { not: playerId } },
                { player2Id: { not: playerId } },
              ],
            },
          },
        ],
      },

      include: {
        participants: {
          where: {
            OR: [
              { playerId },
              {
                duo: {
                  OR: [{ player1Id: playerId }, { player2Id: playerId }],
                },
              },
            ],
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }

  async listChampionships(): Promise<ChampionshipBriefEntity[]> {
    const championships = await this._prismaService.championship.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        isDuo: true,
        winner: { select: { name: true } },
        duoWinner: {
          select: {
            player1: { select: { id: true, name: true } },
            player2: { select: { id: true, name: true } },
          },
        },
        _count: { select: { matches: true } },
      },
    });

    return championships.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: DateTime.fromJSDate(c.createdAt),
      isDuo: c.isDuo,
      matchCount: c._count.matches,
      winnerName:
        c.winner?.name ??
        (c.duoWinner
          ? c.duoWinner.player1.id === c.duoWinner.player2.id
            ? c.duoWinner.player1.name
            : `${c.duoWinner.player1.name} & ${c.duoWinner.player2.name}`
          : null),
    }));
  }

  async getAllTimeRecords(): Promise<AllTimeRecordsData> {
    const [topGoalsRow, matchCountRow, champWinners, allSoloMatches] =
      await Promise.all([
        // Top scorer (aggregate goals per player)
        this._prismaService.matchParticipant.groupBy({
          by: ['playerId'],
          where: { playerId: { not: null } },
          _sum: { goals: true },
          orderBy: { _sum: { goals: 'desc' } },
          take: 1,
        }),
        // Most matches played
        this._prismaService.matchParticipant.groupBy({
          by: ['playerId'],
          where: { playerId: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
        }),
        // Championship solo wins
        this._prismaService.championship.findMany({
          where: { winnerId: { not: null } },
          select: { winnerId: true, winner: { select: { id: true, name: true } } },
        }),
        // All solo matches for win-rate, biggest-win, most-goals-in-one-match
        this._prismaService.match.findMany({
          include: {
            participants: {
              where: { playerId: { not: null } },
              include: { player: { select: { id: true, name: true } } },
            },
            championship: { select: { title: true } },
          },
        }),
      ]);

    // Resolve player names for top scorer / most matches
    const playerIds = [
      topGoalsRow[0]?.playerId,
      matchCountRow[0]?.playerId,
    ].filter((id): id is string => !!id);

    const players =
      playerIds.length > 0
        ? await this._prismaService.player.findMany({
            where: { id: { in: playerIds } },
            select: { id: true, name: true },
          })
        : [];
    const playerMap = new Map(players.map((p) => [p.id, p.name]));

    // --- biggest win & most goals in one match ---
    let biggestWin: AllTimeRecordsData['biggestWin'] = null;
    let mostGoalsInOneMatch: AllTimeRecordsData['mostGoalsInOneMatch'] = null;

    // win-rate aggregation per player
    const winRateMap = new Map<
      string,
      { name: string; wins: number; total: number }
    >();

    allSoloMatches.forEach((match) => {
      const solo = match.participants.filter((p) => p.playerId);

      // biggest win (requires exactly 2 solo participants)
      if (solo.length === 2) {
        const a = solo[0]!;
        const b = solo[1]!;
        const diff = Math.abs(a.goals - b.goals);
        if (!biggestWin || diff > biggestWin.value) {
          const winner = a.goals >= b.goals ? a : b;
          const loser = a.goals >= b.goals ? b : a;
          biggestWin = {
            playerName: winner.player?.name ?? '',
            opponentName: loser.player?.name ?? '',
            value: diff,
            scoreline: `${winner.goals}–${loser.goals}`,
            championship: match.championship.title,
            phase: match.matchPhase,
          };
        }
      }

      // most goals in one match & win-rate map
      solo.forEach((p) => {
        if (!p.playerId || !p.player) return;

        if (!mostGoalsInOneMatch || p.goals > mostGoalsInOneMatch.value) {
          mostGoalsInOneMatch = {
            playerName: p.player.name,
            value: p.goals,
            championship: match.championship.title,
            phase: match.matchPhase,
          };
        }

        const entry = winRateMap.get(p.playerId) ?? {
          name: p.player.name,
          wins: 0,
          total: 0,
        };
        entry.total++;
        if (match.winnerId === p.playerId) entry.wins++;
        winRateMap.set(p.playerId, entry);
      });
    });

    // best win-rate (min 5 matches)
    let highestWinRate: AllTimeRecordsData['highestWinRate'] = null;
    winRateMap.forEach((entry, id) => {
      if (entry.total < 5) return;
      const wr = Number(((entry.wins / entry.total) * 100).toFixed(2));
      if (!highestWinRate || wr > highestWinRate.winRate) {
        highestWinRate = {
          playerId: id,
          playerName: entry.name,
          winRate: wr,
          matchesPlayed: entry.total,
        };
      }
    });

    // most titles
    const titlesMap = new Map<string, { name: string; count: number }>();
    champWinners.forEach((c) => {
      if (!c.winner) return;
      const e = titlesMap.get(c.winner.id) ?? { name: c.winner.name, count: 0 };
      e.count++;
      titlesMap.set(c.winner.id, e);
    });
    let mostTitles: AllTimeRecordsData['mostTitles'] = null;
    titlesMap.forEach((e, id) => {
      if (!mostTitles || e.count > mostTitles.value) {
        mostTitles = { playerId: id, playerName: e.name, value: e.count };
      }
    });

    return {
      topScorer: topGoalsRow[0]
        ? {
            playerId: topGoalsRow[0].playerId!,
            playerName: playerMap.get(topGoalsRow[0].playerId!) ?? '',
            value: topGoalsRow[0]._sum.goals ?? 0,
          }
        : null,
      mostMatchesPlayed: matchCountRow[0]
        ? {
            playerId: matchCountRow[0].playerId!,
            playerName: playerMap.get(matchCountRow[0].playerId!) ?? '',
            value: matchCountRow[0]._count.id,
          }
        : null,
      mostTitles,
      highestWinRate,
      biggestWin,
      mostGoalsInOneMatch,
    };
  }

  async getTopRivalries(limit: number): Promise<RivalryData[]> {
    const matches = await this._prismaService.match.findMany({
      include: {
        participants: {
          where: { playerId: { not: null } },
          include: { player: { select: { id: true, name: true } } },
        },
      },
    });

    const rivalryMap = new Map<string, RivalryData>();

    matches.forEach((match) => {
      const solo = match.participants.filter((p) => p.playerId && p.player);
      if (solo.length !== 2) return;

      const first = solo[0]!;
      const second = solo[1]!;
      const x = first.playerId! < second.playerId! ? first : second;
      const y = first.playerId! < second.playerId! ? second : first;

      const key = `${x.playerId!}:${y.playerId!}`;
      const rivalry = rivalryMap.get(key) ?? {
        player1Id: x.playerId!,
        player1Name: x.player!.name,
        player2Id: y.playerId!,
        player2Name: y.player!.name,
        matchesPlayed: 0,
        player1Wins: 0,
        player2Wins: 0,
        draws: 0,
        player1Goals: 0,
        player2Goals: 0,
        classicScore: 0,
      };

      rivalry.matchesPlayed++;
      rivalry.player1Goals += x.goals;
      rivalry.player2Goals += y.goals;

      if (!match.winnerId) {
        rivalry.draws++;
      } else if (match.winnerId === x.playerId!) {
        rivalry.player1Wins++;
      } else {
        rivalry.player2Wins++;
      }

      rivalryMap.set(key, rivalry);
    });

    // classicScore = matches - |p1wins - p2wins|
    // Peaks when perfectly balanced, falls to 0 when completely one-sided
    rivalryMap.forEach((r) => {
      r.classicScore = r.matchesPlayed - Math.abs(r.player1Wins - r.player2Wins);
    });

    return Array.from(rivalryMap.values())
      .sort((a, b) => b.classicScore - a.classicScore || b.matchesPlayed - a.matchesPlayed)
      .slice(0, limit);
  }

  async getRecentMatchesForPlayer(
    playerId: string,
    limit: number,
  ): Promise<PlayerFormData[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        participants: {
          some: {
            OR: [
              { playerId },
              { duo: { OR: [{ player1Id: playerId }, { player2Id: playerId }] } },
            ],
          },
        },
      },
      include: {
        participants: {
          include: {
            player: { select: { id: true, name: true } },
            duo: {
              include: {
                player1: { select: { id: true, name: true } },
                player2: { select: { id: true, name: true } },
              },
            },
          },
        },
        championship: { select: { title: true, createdAt: true } },
      },
      orderBy: { championship: { createdAt: 'desc' } },
      take: limit * 10,

    });

    // Secondary sort by phase weight so later rounds appear before earlier rounds
    // within the same championship (Prisma can't do this natively without createdAt on Match)
    const PHASE_WEIGHT: Record<string, number> = {
      GROUP_STAGE: 1, 'PLAY-INS': 2, ROUND_OF_16: 3,
      ROUND_1_LOWER: 3, QUARTER_FINALS: 4, UPPER_BRACKET_QUARTER_FINALS: 4,
      ROUND_2_LOWER: 4, UPPER_BRACKET_SEMIFINALS: 5, SEMIFINALS: 5,
      ROUND_3_LOWER: 5, UPPER_BRACKET_FINALS: 6, LOWER_BRACKET_FINALS: 6,
      THIRD_PLACE: 6, FINALS: 7,
    };

    matches.sort((a, b) => {
      const dateDiff =
        b.championship.createdAt.getTime() - a.championship.createdAt.getTime();
      if (dateDiff !== 0) return dateDiff;
      return (PHASE_WEIGHT[b.matchPhase] ?? 0) - (PHASE_WEIGHT[a.matchPhase] ?? 0);
    });

    const result: PlayerFormData[] = [];

    for (const match of matches) {
      if (result.length >= limit) break;

      const mine = match.participants.find(
        (p) =>
          p.playerId === playerId ||
          (p.duo &&
            (p.duo.player1Id === playerId || p.duo.player2Id === playerId)),
      );
      if (!mine) continue;

      const theirs = match.participants.find((p) => p !== mine);

      const goalsFor = mine.goals;
      const goalsAgainst = theirs?.goals ?? 0;

      let matchResult: 'W' | 'D' | 'L';
      if (!match.winnerId && !match.duoWinnerId) {
        matchResult = 'D';
      } else {
        const winnerId = match.winnerId ?? match.duoWinnerId;
        const iWon =
          winnerId === playerId ||
          (mine.duo &&
            (mine.duo.player1Id === playerId ||
              mine.duo.player2Id === playerId) &&
            winnerId === mine.duoId);
        matchResult = iWon ? 'W' : 'L';
      }

      let opponentName = '?';
      if (theirs?.player) {
        opponentName = theirs.player.name;
      } else if (theirs?.duo) {
        const d = theirs.duo;
        opponentName =
          d.player1.id === d.player2.id
            ? d.player1.name
            : `${d.player1.name} & ${d.player2.name}`;
      }

      const decidedByPenalties =
        goalsFor === goalsAgainst &&
        (mine.penaltyShootoutGoals ?? 0) > 0;

      result.push({
        result: matchResult,
        goalsFor,
        goalsAgainst,
        opponentName,
        championship: match.championship.title,
        phase: match.matchPhase,
        decidedByPenalties,
      });
    }

    return result;
  }

  async getMatchHistoryDetailForPlayers(
    p1Id: string,
    p2Id: string,
  ): Promise<H2HMatchDetailData[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        AND: [
          {
            participants: {
              some: { OR: [{ playerId: p1Id }, { duoId: p1Id }] },
            },
          },
          {
            participants: {
              some: { OR: [{ playerId: p2Id }, { duoId: p2Id }] },
            },
          },
        ],
      },
      include: {
        participants: {
          select: { goals: true, playerId: true, duoId: true },
        },
        championship: { select: { title: true, createdAt: true } },
      },
      orderBy: { championship: { createdAt: 'desc' } },
    });

    return matches.map((match) => {
      const p1Part = match.participants.find(
        (p) => p.playerId === p1Id || p.duoId === p1Id,
      );
      const p2Part = match.participants.find(
        (p) => p.playerId === p2Id || p.duoId === p2Id,
      );

      const goalsP1 = p1Part?.goals ?? 0;
      const goalsP2 = p2Part?.goals ?? 0;

      let result: 'W' | 'D' | 'L';
      if (goalsP1 > goalsP2) result = 'W';
      else if (goalsP1 < goalsP2) result = 'L';
      else result = 'D';

      return {
        championship: match.championship.title,
        year: match.championship.createdAt.getFullYear(),
        phase: match.matchPhase,
        goalsP1,
        goalsP2,
        result,
      };
    });
  }

  async getAllMatchesDrawnByPlayerId(playerId: string): Promise<MatchEntity[]> {
    const matches = await this._prismaService.match.findMany({
      where: {
        participants: {
          some: {
            OR: [
              { playerId: playerId },
              {
                duo: {
                  OR: [{ player1Id: playerId }, { player2Id: playerId }],
                },
              },
            ],
          },
        },
        winnerId: null,
        duoWinnerId: null,
      },
      include: {
        participants: {
          where: {
            OR: [
              { playerId: playerId },
              {
                duo: {
                  OR: [{ player1Id: playerId }, { player2Id: playerId }],
                },
              },
            ],
          },
          include: {
            player: true,
            duo: true,
          },
        },
      },
    });

    return matches.map(mapToMatchEntity);
  }
}
