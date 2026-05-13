import {
  GeneralErrorResponse,
  ErrorDetail,
} from '../interfaces/exception.interface';
import { Logger } from '@nestjs/common';
import { ErrorDetailBuilder } from './error-detail-builder';

export class ErrorResponseBuilder {
  static build(
    success: boolean,
    statusCode: number,
    message: string,
    errors: string[] | string | number | ErrorDetail,
    method: string,
    path: string,
    timestamp: string,
  ): GeneralErrorResponse {
    let sanitizedErrors: ErrorDetail[];

    if (this.isErrorDetail(errors)) {
      sanitizedErrors = [errors];
    } else if (this.isErrorDetailArray(errors)) {
      sanitizedErrors = errors;
    } else if (Array.isArray(errors) && typeof errors[0] === 'string') {
      sanitizedErrors = [{ field: 'general', message: errors }];
    } else {
      sanitizedErrors = [{ field: 'general', message: [String(errors)] }];
    }

    return {
      success,
      statusCode,
      message,
      errors: sanitizedErrors,
      method,
      path,
      timestamp,
    };
  }

  private static isErrorDetail = (errors: unknown): errors is ErrorDetail => {
    return (
      typeof errors === 'object' &&
      errors !== null &&
      !Array.isArray(errors) &&
      'field' in errors
    );
  };
  private static isErrorDetailArray = (
    errors: unknown,
  ): errors is ErrorDetail[] =>
    (errors as ErrorDetail[])[0].field !== undefined;
}
