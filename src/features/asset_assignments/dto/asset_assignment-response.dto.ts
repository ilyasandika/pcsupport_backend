import { Expose, Type } from 'class-transformer';
import { EmployeeResponseDto } from '../../employees/dto/employee-response.dto';

export class DetailAssetAssignmentResponseDto {
  @Expose()
  id: number;

  @Expose()
  assetId: number;

  @Expose()
  picEmployeeId: number;

  @Expose()
  @Type(() => EmployeeResponseDto)
  employee: EmployeeResponseDto;

  @Expose()
  userNonEmployeeName?: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt?: Date;

  @Expose()
  remarks?: string;
}

export class AssetAssignmentResponseDto {
  @Expose()
  userNonEmployeeName?: string;
  @Expose()
  assignedAt: Date;
  @Expose()
  @Type(() => EmployeeResponseDto)
  employee: EmployeeResponseDto;
}
