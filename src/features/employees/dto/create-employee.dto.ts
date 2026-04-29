import { EmployeeContractType } from '../../../common/enums/contract-type.enum';
import { EmployeeStatus } from '../../../common/enums/employee-status.enum';

export class CreateEmployeeDto {
  employeeId: string;
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
  status: EmployeeStatus;
  retireDate?: Date;
}
