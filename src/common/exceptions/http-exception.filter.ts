import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpExceptionBody,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseBuilder } from '../utils/error-response-builder';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as HttpExceptionBody;
    response
      .status(status)
      .json(
        ErrorResponseBuilder.build(
          false,
          status,
          exceptionResponse.error || 'error',
          exceptionResponse.message,
          request.method,
          request.url,
          new Date().toISOString(),
        ),
      );
  }
}
