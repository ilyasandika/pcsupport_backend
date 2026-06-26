import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { Expose, Type } from 'class-transformer';
import { SlaPolicyResponseDto } from '../../sla-policies/dto/sla-policy-response.dto';
import { Role } from '../../../common/enums/role.enum';
import { AssetCategory } from '../../../common/enums/asset-type.enum';

class Asset {
  @Expose()
  serialNumber: string;
  @Expose()
  assetTag: string;
  @Expose()
  hostname: string;
  @Expose()
  category: AssetCategory;

  @Expose()
  assetAssignment: {
    name: string;
    nik: string;
    userNonEmployeeName?: string;
  };
}

class User {
  @Expose()
  fullName: string;
  @Expose()
  role: Role;
}

class Employee {
  @Expose()
  name: string;
  @Expose()
  nik: string;
}

class Location {
  @Expose()
  name: string;
}

export class TicketResponseDto {
  @Expose()
  id: number;

  @Expose()
  fullNumber: string;

  @Expose()
  @Type(() => Asset)
  asset?: Asset;

  @Expose()
  @Type(() => User)
  engineer?: User;

  @Expose()
  @Type(() => Employee)
  employee?: Employee;

  @Expose()
  @Type(() => User)
  createdBy: User;

  @Expose()
  @Type(() => SlaPolicyResponseDto)
  slaPolicy: SlaPolicyResponseDto;

  @Expose()
  @Type(() => Location)
  location: Location;

  @Expose()
  problem: string;

  @Expose()
  status: TicketStatus;

  @Expose()
  solution?: string;

  @Expose()
  startAt: string;

  @Expose()
  solvedAt?: string;

  @Expose()
  remarks?: string;

  @Expose()
  createdAt: Date;
}
