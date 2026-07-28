import { Expose } from 'class-transformer';

export class SlaPolicyResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  priority: string;

  @Expose()
  description: string;

  @Expose()
  responseTimeSeconds: number;

  @Expose()
  resolutionTimeSeconds: number;

  @Expose()
  isBusinessHourOnly: boolean;
}
