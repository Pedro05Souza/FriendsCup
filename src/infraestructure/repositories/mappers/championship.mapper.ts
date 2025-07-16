import { DateTime } from 'luxon';
import type { ChampionshipEntity } from 'src/domain/entities/championship.entity';
import type { ChampionshipData } from '../championship.repository';

export function mapToChampionshipEntity(
  championship: ChampionshipData,
): ChampionshipEntity {
  return {
    id: championship.id,
    title: championship.title,
    createdAt: DateTime.fromJSDate(championship.createdAt),
    isDuo: championship.isDuo,
    matchIds: championship.matches.map((match) => match.id),
    participantsIds: [
      ...(championship.duos || []).map((duo) => duo.id),
      ...(championship.players || []).map((player) => player.id),
    ],
  };
}
