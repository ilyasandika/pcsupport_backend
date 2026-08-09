export interface ApiResponseDto<T> {
  success: boolean;
  statusCode: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  data: T | any;
  meta?: any;
}
