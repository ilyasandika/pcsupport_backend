import { Expose, Type } from 'class-transformer';
import { EmployeeResponseDto } from '../../employees/dto/employee-response.dto';
import { AssetResponseDto } from '../../assets/dto/asset-response.dto';

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
