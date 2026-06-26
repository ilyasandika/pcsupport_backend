import { Expose, Type } from 'class-transformer';
class Employee {
  @Expose()
  name: number;
  @Expose()
  nik: number;
}

export class AssetAssignmentResponseDto {
  @Expose()
  id: number;
  
  @Expose()
  assetId: number;

  @Expose()
  picEmployeeId: number;

  @Expose()
  @Type(() => Employee)
  employee: Employee;

  @Expose()
  userNonEmployeeName?: string;

  @Expose()
  assignedAt: Date;

  @Expose()
  returnedAt?: Date;

  @Expose()
  remarks?: string;
}
