import { EmployeeContractType } from '../../../common/enums/contract-type.enum';

export class CreateEmployeeDto {
  nik: string;
  name: string;
  contractType: EmployeeContractType;
  position: string;
  positionId: string;
  fs: string;
  mjl: string;
  bod: string;
  religion: string;
  directorate: string;
  division: string;
  department: string;
  status: boolean;
  retireDate?: Date;
}
