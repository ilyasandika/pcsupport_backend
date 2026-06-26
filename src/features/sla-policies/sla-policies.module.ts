import { Module } from '@nestjs/common';
import { SlaPoliciesService } from './sla-policies.service';
import { SlaPoliciesController } from './sla-policies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlaPolicy])],
  controllers: [SlaPoliciesController],
  providers: [SlaPoliciesService],
})
export class SlaPoliciesModule {}
