import {
  IsBoolean,
  IsDateString, isEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { ErrorDetailBuilder } from '../../../common/utils/error-detail-builder';
import { AssetAssignment } from '../entities/asset_assignment.entity';

export class CreateAssetAssignmentDto {
  @IsNumber()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  @IsNotEmpty()
  picEmployeeId: number;

  @IsString()
  @IsOptional()
  userNonEmployeeName?: string;

  @IsDateString()
  @IsNotEmpty()
  assignedAt: Date;

  @IsOptional()
  @IsDateString()
  @ValidateIf((o: AssetAssignment) => {
    if (o.returnedAt && new Date(o.returnedAt) < new Date(o.assignedAt)) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(
          'return date must be after or equal to assign date',
          'returnedAt',
        ),
      );
    }
    return true;
  })
  returnedAt?: Date;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  @ValidateIf((o: AssetAssignment) => {
    if (o.isLegacyData && isEmpty(o.returnedAt)) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(
          'return date must be not empty',
          'returnedAt',
        ),
      );
    }
    return true;
  })
  isLegacyData: boolean;
}
