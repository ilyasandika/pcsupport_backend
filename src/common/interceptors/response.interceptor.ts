import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { Reflector } from '@nestjs/core';
import { SKIP_SERIALIZATION } from '../decorators/use-typia.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    const skipSerialization = this.reflector.get<boolean>(
      SKIP_SERIALIZATION,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((result: T | PaginatedResponseDto<T>) => {
        const processData = (data: T[]) => {
          if (skipSerialization) {
            return data;
          }
          return instanceToPlain(data, {
            excludeExtraneousValues: true,
          });
        };

        if (isPaginatedDto(result)) {
          // const serializedData = instanceToPlain(result.data, {
          //   excludeExtraneousValues: true,
          // });

          return {
            success: true,
            statusCode: response.statusCode,
            message: 'Successfully',
            data: processData(result.data),
            meta: result.meta,
          };
        }

        const serializedData = instanceToPlain(result, {
          excludeExtraneousValues: true,
        });

        return {
          success: true,
          statusCode: response.statusCode,
          message: 'Successfully',
          data: serializedData,
        };
      }),
    );
  }
}

function isPaginatedDto<T>(res: any): res is PaginatedResponseDto<T> {
  return !!res && typeof res === 'object' && 'data' in res && 'meta' in res;
}
