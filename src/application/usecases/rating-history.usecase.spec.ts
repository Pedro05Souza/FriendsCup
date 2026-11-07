import { DateTime } from 'luxon';
import { RatingHistoryUsecase } from './rating-history.usecase';
import type { ChampionshipRepository } from 'src/domain/interfaces/championship.interface';
import type { PlayerRepository } from 'src/domain/interfaces/player.interface';
import type {
  RatingSnapshotEntity,
  RatingSnapshotRepository,
} from 'src/domain/interfaces/rating-snapshot.interface';
import { PlayerEntity } from 'src/domain/entities/player.entity';

const date = (iso: string): DateTime => DateTime.fromISO(iso, { zone: 'utc' });

const cups = [
  { id: 'nabor', createdAt: date('2024-04-07') },
  { id: 'deives', createdAt: date('2024-12-14') },
  { id: 'polar', createdAt: date('2025-06-28') },
  { id: 'chilela', createdAt: date('2025-07-11') },
];

function snap(
  player: string,
  cup: string,
  scale: 'LEGACY_5' | 'POINTS_100',
  raw: number,
  overall: number,
): RatingSnapshotEntity {
  return {
    id: `${player}-${cup}`,
    playerId: player,
    playerName: player,
    championshipId: cup,
    championshipTitle: cup,
    takenAt: cups.find((c) => c.id === cup)!.createdAt,
    scale,
    rawOverall: raw,
    overall,
    attack: null,
    defense: null,
    intelligence: null,
    mentality: null,
  };
}

function setup(snapshots: RatingSnapshotEntity[]): {
  usecase: RatingHistoryUsecase;
  saved: jest.Mock;
} {
  const saved = jest.fn(async () => undefined);
  const snapshotRepo = {
    findAll: jest.fn(async () => snapshots),
    findByPlayer: jest.fn(async (id: string) =>
      snapshots.filter((s) => s.playerId === id),
    ),
    saveForChampionship: saved,
  } as unknown as RatingSnapshotRepository;

  const leo = new PlayerEntity({
    id: 'leo',
    name: 'Leo',
    attack: 99,
    defense: 92,
    intelligence: 98,
    mentality: 72,
  });
  const playerRepo = {
    findById: jest.fn(async (id: string) => (id === 'leo' ? leo : null)),
  } as unknown as PlayerRepository;

  const championshipRepo = {
    findChampionshipById: jest.fn(
      async (id: string) => cups.find((c) => c.id === id) ?? null,
    ),
    listChampionships: jest.fn(async () => cups),
    findParticipantsByChampionshipId: jest.fn(async () => [
      { id: 'duo-1', name: 'Leo', player1: leo, player2: leo },
    ]),
  } as unknown as ChampionshipRepository;

  return {
    usecase: new RatingHistoryUsecase(
      snapshotRepo,
      playerRepo,
      championshipRepo,
    ),
    saved,
  };
}

describe('RatingHistoryUsecase', () => {
  const history = [
    snap('leo', 'nabor', 'LEGACY_5', 4.4, 87),
    snap('leo', 'deives', 'LEGACY_5', 4.8, 91),
    snap('cruz', 'deives', 'LEGACY_5', 2.8, 71),
    snap('leo', 'polar', 'POINTS_100', 87, 87),
    snap('leo', 'chilela', 'POINTS_100', 90, 90),
    snap('cruz', 'chilela', 'POINTS_100', 67, 67),
  ];

  it('compares each rating with the latest one before the cup', async () => {
    const { usecase } = setup(history);
    const result = await usecase.getChampionshipChanges('chilela');
    const leo = result.changes.find((c) => c.playerId === 'leo')!;
    expect(leo.before.championshipId).toBe('polar');
    expect(leo.delta).toBe(3);
    expect(leo.rawDelta).toBe(3);
    // Cruz skipped Polar, so his change runs from Deives
    const cruz = result.changes.find((c) => c.playerId === 'cruz')!;
    expect(cruz.before.championshipId).toBe('deives');
  });

  it('reports old-scale changes on the old scale', async () => {
    const { usecase } = setup(history);
    const leo = (await usecase.getChampionshipChanges('deives')).changes[0]!;
    expect(leo.rawDelta).toBe(0.4);
    expect(leo.delta).toBe(4);
  });

  it('has no same-scale change across the switch to 0-100', async () => {
    const { usecase } = setup(history);
    const leo = (await usecase.getChampionshipChanges('polar')).changes[0]!;
    expect(leo.rawDelta).toBeNull();
    expect(leo.delta).toBe(-4);
  });

  it('lists first-time ratings separately', async () => {
    const { usecase } = setup(history);
    const result = await usecase.getChampionshipChanges('deives');
    expect(result.firstRatings.map((f) => f.playerId)).toEqual(['cruz']);
  });

  it('only lets the latest cup save ratings', async () => {
    const { usecase, saved } = setup(history);
    await expect(usecase.saveChampionshipRatings('polar')).rejects.toThrow(
      /most recent cup/,
    );
    expect(saved).not.toHaveBeenCalled();
    expect((await usecase.getChampionshipChanges('chilela')).canSave).toBe(
      true,
    );
  });

  it('saves a solo duo player once, with current ratings', async () => {
    const { usecase, saved } = setup(history);
    const result = await usecase.saveChampionshipRatings('chilela');
    expect(result.saved).toBe(1);
    expect(saved).toHaveBeenCalledWith('chilela', expect.anything(), [
      {
        playerId: 'leo',
        overall: 90,
        attack: 99,
        defense: 92,
        intelligence: 98,
        mentality: 72,
      },
    ]);
  });
});
