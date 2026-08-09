// common/utils/paginate.util.ts
import {
  SelectQueryBuilder,
  ObjectLiteral,
  Repository,
  FindManyOptions,
} from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { Logger } from '@nestjs/common';

export async function paginateQb<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PaginationQueryDto,
): Promise<PaginatedResponseDto<T>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}


export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  query: PaginationQueryDto,
  options: FindManyOptions<T> = {},
): Promise<PaginatedResponseDto<T>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

