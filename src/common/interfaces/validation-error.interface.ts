export interface ApiValidationError {
  message: string;
  errors: {
    field: string;
    errors: string[];
  }[];
}
