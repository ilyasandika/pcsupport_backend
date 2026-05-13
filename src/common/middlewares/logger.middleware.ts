import { Injectable, Logger, LogLevel, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpLogging } from '../interfaces/logging.interface';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {



    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = { ...req.body };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.password) payload.password = '**********';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.token) payload.token = '**********';

      const log: HttpLogging = {
        timestamp: Logger.getTimestamp(),
        level: 'log',
        ipAddress: req.ip,
        method: req.method,
        url: req.baseUrl,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        payload: payload,
      };
      Logger.log(log);
    }
    next();
  }
}