import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetAssignmentDto } from './create-asset_assignment.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAssetAssignmentDto extends PartialType(
  CreateAssetAssignmentDto,
) {
  @IsOptional()
  @IsBoolean()
  isUnderMaintenance?: boolean;
}
