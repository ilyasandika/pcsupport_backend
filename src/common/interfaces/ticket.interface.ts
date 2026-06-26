import { AssetCategory } from '../enums/asset-type.enum';
import { Role } from '../enums/role.enum';
import { TicketStatus } from '../enums/ticket-status.enum';

export interface ITicketResponse {
  id: number;
  fullNumber: string;
  asset?: {
    id: number;
    serialNumber: string;
    assetTag: string;
    hostname: string;
    category: AssetCategory;
    brand: string;
    model: string;
  };
  engineer?: {
    id: number;
    username: string;
    email: string;
    role: Role;
  };
  user?: {
    employeeId: number;
    nik: string;
    name: string;
    userNonEmployee?: string;
  };
  createdBy: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  sla: {
    id: number;
    name: string;
    description: string;
    resolutionTime: number;
    responseTime: number;
  };
  location: {
    id: number;
    name: string;
  };

  problem: string;
  status: TicketStatus;
  solution?: string;
  startAt: string;
  solvedAt?: string;
  remarks?: string;
}
