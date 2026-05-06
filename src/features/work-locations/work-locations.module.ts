import { Module } from '@nestjs/common';
import { WorkLocationsService } from './work-locations.service';
import { WorkLocationsController } from './work-locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkLocation } from './entities/work-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkLocation])],
  controllers: [WorkLocationsController],
  providers: [WorkLocationsService],
})
export class WorkLocationsModule {}
