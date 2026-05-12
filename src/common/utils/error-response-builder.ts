import {
  GeneralErrorResponse,
  ErrorDetail,
} from '../interfaces/exception.interface';

export class ErrorResponseBuilder {
  static build(
    success: boolean,
    statusCode: number,
    message: string,
    errors: string[] | string | number,
    method: string,
    path: string,
    timestamp: string,
  ): GeneralErrorResponse {

    let sanitizedErrors: ErrorDetail[];
    if (Array.isArray(errors) && typeof errors[0] === 'object') {
      sanitizedErrors = errors as unknown as ErrorDetail[];
    } else if (Array.isArray(errors)) {
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
}
