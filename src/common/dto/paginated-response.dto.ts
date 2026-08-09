import { Expose } from 'class-transformer';

export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
  @Expose()
  data: T[];
  @Expose()
  meta: PaginationMeta;
}
