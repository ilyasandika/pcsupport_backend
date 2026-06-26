import { EmployeeContractType } from '../../../common/enums/contract-type.enum';
import { Expose } from 'class-transformer';

export class EmployeeResponseDto {
  @Expose()
  id: number;

  @Expose()
  nik: string;

  @Expose()
  name: string;

  @Expose()
  contractType: EmployeeContractType;

  @Expose()
  position: string;

  @Expose()
  positionId: string;

  @Expose()
  fs: string;

  @Expose()
  mjl: string;

  @Expose()
  bod: string;

  @Expose()
  religion: string;

  @Expose()
  directorate: string;

  @Expose()
  division: string;

  @Expose()
  department: string;

  @Expose()
  status?: boolean;

  @Expose()
  retireDate?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
