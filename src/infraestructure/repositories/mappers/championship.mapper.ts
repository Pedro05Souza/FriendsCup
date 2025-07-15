import type { Championship } from '@prisma/client';
import { DateTime } from 'luxon';
import type { RawChampionshipEntity } from 'src/domain/entities/championship.entity';

export function mapToRawChampionshipEntity(
  championship: Championship,
): RawChampionshipEntity {
  return {
    id: championship.id,
    title: championship.title,
    createdAt: DateTime.fromJSDate(championship.createdAt),
    isDuo: championship.isDuo,
  };
}
