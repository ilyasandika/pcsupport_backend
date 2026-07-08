import { Expose } from 'class-transformer';

export class DetailWorkLocationResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  address: string;

  @Expose()
  longitude: number;

  @Expose()
  latitude: number;


  createdAt: Date;


  updatedAt: Date;
}

export class WorkLocationResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}