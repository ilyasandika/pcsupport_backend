import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ApiValidationError } from '../interfaces/validation-error.interface';

export const globalValidationPipeConfig: ValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (validationErrors = []) => {
    const errors: ApiValidationError = {
      message: 'Validation Errors',
      errors: validationErrors.map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      })),
    };

    return new BadRequestException(errors);
  },
});
