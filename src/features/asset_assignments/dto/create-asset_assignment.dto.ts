import {
  IsBoolean,
  IsDateString,
  isEmpty,
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
  @IsString()
  @IsNotEmpty()
  assetTag: string;

  @IsString()
  @IsNotEmpty()
  picEmployeeNik: string;

  @IsString()
  @IsOptional()
  userNonEmployeeName?: string;

  @IsDateString()
  @IsNotEmpty()
  assignedAt: Date;

  @IsOptional()
  @IsBoolean()
  isBackup?: boolean;

  @IsOptional()
  @IsNumber()
  assignById?: number;

  @IsOptional()
  @IsNumber()
  createdById?: number;

  @IsOptional()
  @IsString()
  contact?: string;

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
  assignRemarks?: string;

  @IsOptional()
  @IsString()
  returnRemarks?: string;

  @IsOptional()
  @IsString()
  legacyBastStatus?: string;


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
  isLegacyData?: boolean;
}
