import { EmployeeContractType } from '../../../common/enums/contract-type.enum';
import { Expose, Type } from 'class-transformer';
import {
  DetailAssetAssignmentResponseDto,
} from '../../asset_assignments/dto/asset_assignment-response.dto';
import { TicketResponseDtoForAsset } from '../../tickets/dto/ticket-response.dto';

export class DetailEmployeeResponseDto {
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
  @Type(() => TicketResponseDtoForAsset)
  tickets: TicketResponseDtoForAsset[];

  @Expose()
  @Type(() => DetailAssetAssignmentResponseDto)
  assetAssignments: DetailAssetAssignmentResponseDto[];

  @Expose()
  status?: boolean;

  @Expose()
  retireDate?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class EmployeeResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  nik: string;
  @Expose()
  position: string;
  @Expose()
  department: string;
}
