import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

type FilterConfig = {
  column: string;
  operator?: 'like' | 'exact';
};

export function applyFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: Record<string, string | undefined>,
  config: Record<string, FilterConfig>,
) {
  for (const key of Object.keys(filters)) {
    const value = filters[key];
    if (!value) continue;

    const { column, operator = 'like' } = config[key] ?? { column: key };
    const paramName = key.replace(/\./g, '_');

    if (operator === 'exact') {
      qb.andWhere(`${column} = :${paramName}`, { [paramName]: value });
    } else {
      qb.andWhere(`${column} ILIKE :${paramName}`, {
        [paramName]: `%${value}%`,
      });
    }
  }
  return qb;
}
