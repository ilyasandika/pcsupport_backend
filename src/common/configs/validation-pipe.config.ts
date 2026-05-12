import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ErrorDetail } from '../interfaces/exception.interface';

export const globalValidationPipeConfig: ValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (validationErrors = []) => {
    const errors: ErrorDetail[] = validationErrors.map((error) => ({
      field: error.property,
      message: Object.values(error.constraints || {}),
    }));
    return new BadRequestException(errors);
  },
});
