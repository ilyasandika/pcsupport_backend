import { Expose, Type } from 'class-transformer';
import { EmployeeResponseDto } from '../../employees/dto/employee-response.dto';
import { AssetResponseDto } from '../../assets/dto/asset-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PickType } from '@nestjs/mapped-types';

export class DetailAssetAssignmentResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => AssetResponseDto)
  asset: AssetResponseDto;

  @Expose()
  @Type(() => EmployeeResponseDto)
  employee: EmployeeResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto;

  @Expose()
  userNonEmployeeName?: string;

  @Expose()
  isBackup: boolean;

  @Expose()
  backupForAssetTag?: string;

  @Expose()
  isUnderMaintenance: boolean;

  @Expose()
  assignedAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  assignBy: UserResponseDto;

  @Expose()
  returnedAt?: Date;

  @Expose()
  assignRemarks?: string;

  @Expose()
  returnRemarks?: string;

  @Expose()
  legacyBastStatus?: string;

  @Expose()
  assignFilePath?: string;

  @Expose()
  contact: string;

  @Expose()
  returnFilePath?: string;

  @Expose()
  assignUserSignaturePath?: string | null;

  @Expose()
  returnUserSignaturePath?: string | null;

  @Expose()
  @Type(() => UserResponseDto)
  returnBy?: UserResponseDto;

  @Expose()
  assignFullTicketNumber?: string;

  @Expose()
  returnFullTicketNumber?: string;

  @Expose()
  assignTicket?: any;

  @Expose()
  returnTicket?: any;

  @Expose()
  remarks?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class AssetAssignmentResponseDto extends PickType(
  DetailAssetAssignmentResponseDto,
  ['userNonEmployeeName', 'assignedAt', 'employee'] as const,
) {
  @Expose()
  userNonEmployeeName?: string;
  @Expose()
  assignedAt: Date;
  @Expose()
  @Type(() => EmployeeResponseDto)
  employee: EmployeeResponseDto;
}
