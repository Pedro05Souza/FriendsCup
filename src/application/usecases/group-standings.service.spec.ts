import { GroupStandingsService } from './group-standings.service';
import type { ChampionshipRepository } from 'src/domain/interfaces/championship.interface';
import type { GroupEntity } from 'src/domain/entities/group.entity';
import { GroupPlayerEntity } from 'src/domain/entities/player.entity';

type Table = Record<string, number[]>;

interface FakeRepository {
  repository: ChampionshipRepository;
  table: () => Table;
  raw: Record<string, jest.Mock>;
}

/** A group table held in memory, behind just the repository calls the service uses. */
function fakeRepository(
  rows: Array<{ id: string; points: number; goalDifference: number }>,
): FakeRepository {
  const group: GroupEntity = {
    id: 'g1',
    championshipId: 'c1',
    groupPlayers: rows.map(
      (row) =>
        new GroupPlayerEntity(
          {
            id: row.id,
            name: row.id,
            attack: 50,
            defense: 50,
            intelligence: 50,
            mentality: 50,
          },
          row.points,
          row.goalDifference,
          `gp-${row.id}`,
        ),
    ),
  };

  const repository = {
    getGroupById: jest.fn(async () => group),
    getGroupByParticipantId: jest.fn(async (id: string) =>
      group.groupPlayers.some((row) => row.id === id) ? group : null,
    ),
    createChampionshipGroup: jest.fn(),
    createGroupParticipant: jest.fn(async (params: { playerId?: string }) => {
      const row = new GroupPlayerEntity(
        {
          id: params.playerId!,
          name: params.playerId!,
          attack: 50,
          defense: 50,
          intelligence: 50,
          mentality: 50,
        },
        0,
        0,
        `gp-${params.playerId}`,
      );
      group.groupPlayers.push(row);
      return row;
    }),
    updateGroupParticipant: jest.fn(async () => undefined),
  };

  const table = (): Table =>
    Object.fromEntries(
      group.groupPlayers.map((row) => [
        row.id,
        [row.points, row.goalDifference],
      ]),
    );

  return {
    repository: repository as unknown as ChampionshipRepository,
    table,
    raw: repository,
  };
}

describe('GroupStandingsService', () => {
  const win = { participantId: 'ana', goals: 3 };
  const loss = { participantId: 'bia', goals: 1 };

  it('adds a result to both rows', async () => {
    const { repository, table } = fakeRepository([
      { id: 'ana', points: 0, goalDifference: 0 },
      { id: 'bia', points: 0, goalDifference: 0 },
    ]);
    await new GroupStandingsService(repository).addResult(
      'c1',
      false,
      win,
      loss,
    );
    expect(table()).toEqual({ ana: [3, 2], bia: [0, -2] });
  });

  it('removing a result undoes exactly what adding it did', async () => {
    // Start from totals that don't come from recorded matches, like some real data
    const { repository, table } = fakeRepository([
      { id: 'ana', points: 7, goalDifference: 4 },
      { id: 'bia', points: 2, goalDifference: -1 },
      { id: 'caio', points: 5, goalDifference: 3 },
    ]);
    const service = new GroupStandingsService(repository);
    const before = table();

    await service.addResult('c1', false, win, loss);
    await service.removeResult('c1', win, loss);

    expect(table()).toEqual(before);
  });

  it('turns a correction into the right net change', async () => {
    const { repository, table } = fakeRepository([
      { id: 'ana', points: 3, goalDifference: 2 },
      { id: 'bia', points: 0, goalDifference: -2 },
    ]);
    const service = new GroupStandingsService(repository);

    // The 3-1 was really a 1-1 draw
    await service.removeResult('c1', win, loss);
    await service.addResult(
      'c1',
      false,
      { participantId: 'ana', goals: 1 },
      { participantId: 'bia', goals: 1 },
    );

    expect(table()).toEqual({ ana: [1, 0], bia: [1, 0] });
  });

  it('adds a row for a player who is new to the group', async () => {
    const { repository, table, raw } = fakeRepository([
      { id: 'ana', points: 0, goalDifference: 0 },
    ]);
    await new GroupStandingsService(repository).addResult(
      'c1',
      false,
      win,
      loss,
    );
    expect(raw.createGroupParticipant).toHaveBeenCalledWith(
      expect.objectContaining({ playerId: 'bia', championshipGroupId: 'g1' }),
    );
    expect(table()).toEqual({ ana: [3, 2], bia: [0, -2] });
  });

  it('leaves the table alone when removing a match whose rows are missing', async () => {
    const { repository, table, raw } = fakeRepository([
      { id: 'caio', points: 4, goalDifference: 1 },
    ]);
    await new GroupStandingsService(repository).removeResult('c1', win, loss);
    expect(raw.updateGroupParticipant).not.toHaveBeenCalled();
    expect(table()).toEqual({ caio: [4, 1] });
  });
});
