import { ErrorDetail } from '../interfaces/exception.interface';

export class ErrorDetailBuilder {
  static buildOne(
    message: string | string[],
    field: string = 'general',
  ): ErrorDetail {
    return {
      field: field,
      message: Array.isArray(message) ? message : [message],
    };
  }

  static buildMany(
    errors: {
      message: string | string[];
      field: string;
    }[],
  ): ErrorDetail[] {
    return errors.map((err) => ({
      field: err.field || 'general',
      message: Array.isArray(err.message) ? err.message : [err.message],
    }));
  }
}