import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const serializedData = instanceToPlain(data, {
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
