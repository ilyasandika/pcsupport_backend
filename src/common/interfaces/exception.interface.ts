export interface GeneralErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
  method: string;
  path: string;
  timestamp: string;
}

export interface ErrorDetail {
  field: string;
  message: string[];
}
