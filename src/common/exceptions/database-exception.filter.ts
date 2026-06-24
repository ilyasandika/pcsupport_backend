import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpExceptionBody,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseBuilder } from '../utils/error-response-builder';
import { QueryFailedError } from 'typeorm';
import { toCamel } from 'ts-case-convert';
import { ErrorDetail } from '../interfaces/exception.interface';

interface DatabaseError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private extractFieldFromDetail(detail: string): string {
    if (!detail) return 'data';

    const match = detail.match(/Key \((.*?)\)=/);

    if (match && match[1]) {
      const rawField = match[1];
      const fieldName = rawField.split('.').pop() || rawField;
      return toCamel(fieldName);
    }

    return 'data';
  }

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const drv = exception.driverError as DatabaseError;
    const errorCode = drv.code;

    Logger.log(drv);
    const field = this.extractFieldFromDetail(drv.detail!);
    const errorMessage = {
      field: field,
      message: [drv.detail as string],
    };

    response
      .status(HttpStatus.CONFLICT)
      .json(
        ErrorResponseBuilder.build(
          false,
          errorCode == '23505' ? HttpStatus.CONFLICT : 500,
          errorCode == '23505' ? 'duplicate resource' : 'server error',
          errorMessage,
          request.method,
          request.url,
          new Date().toISOString(),
        ),
      );
  }
}
