import { TicketStatus } from '../../../common/enums/ticket-status.enum';
import { Expose, Type } from 'class-transformer';
import { SlaPolicyResponseDto } from '../../sla-policies/dto/sla-policy-response.dto';
import { WorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { EmployeeResponseDto } from '../../employees/dto/employee-response.dto';
import { AssetResponseDto } from '../../assets/dto/asset-response.dto';
import { OmitType } from '@nestjs/mapped-types';
import type { TicketSnapshot } from '../interfaces/ticket-snapshot.interface';

export class TicketResponseDto {
  @Expose()
  id: number;

  @Expose()
  fullNumber: string;

  @Expose()
  @Type(() => AssetResponseDto)
  asset?: AssetResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  engineer?: UserResponseDto;

  @Expose()
  @Type(() => EmployeeResponseDto)
  employee?: EmployeeResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto;

  @Expose()
  @Type(() => SlaPolicyResponseDto)
  slaPolicy: SlaPolicyResponseDto;

  @Expose()
  @Type(() => WorkLocationResponseDto)
  location: WorkLocationResponseDto;

  @Expose()
  snapshot?: TicketSnapshot;

  @Expose()
  problem: string;

  @Expose()
  status: TicketStatus;

  @Expose()
  solution?: string;

  @Expose()
  contact?: string;

  @Expose()
  startAt: string;

  @Expose()
  solvedAt?: string;

  @Expose()
  remarks?: string;

  @Expose()
  filePath?: string;

  @Expose()
  createdAt: Date;
}

export class TicketResponseDtoForAsset extends OmitType(TicketResponseDto, [
  'employee',
  'slaPolicy',
  'asset',
  'location',
  'remarks',
  'filePath',
  'createdBy',
  'contact',
  'createdAt',
  'snapshot',
] as const) { }
