import { LogLevel } from '@nestjs/common';

export interface HttpLogging {
  timestamp: string;
  level: LogLevel;
  ipAddress?: string;
  action?: string;
  method: string;
  url: string;
  payload: object;
}
