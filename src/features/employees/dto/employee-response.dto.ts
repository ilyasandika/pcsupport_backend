import { Expose, Type } from 'class-transformer';
import {
  DetailAssetAssignmentResponseDto,
} from '../../asset_assignments/dto/asset_assignment-response.dto';
import { TicketResponseDtoForAsset } from '../../tickets/dto/ticket-response.dto';
import { WorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';
import { PickType } from '@nestjs/mapped-types';

export class DetailEmployeeResponseDto {
  @Expose()
  nik: string;

  @Expose()
  name?: string;

  @Expose()
  position?: string;

  @Expose()
  positionId?: string;

  @Expose()
  fs?: string;

  @Expose()
  mjl?: string;

  @Expose()
  bod?: string;

  @Expose()
  religion?: string;

  @Expose()
  directorate?: string;

  @Expose()
  division?: string;

  @Expose()
  department?: string;

  @Expose()
  @Type(() => WorkLocationResponseDto)
  workLocation: WorkLocationResponseDto;

  @Expose()
  @Type(() => TicketResponseDtoForAsset)
  tickets: TicketResponseDtoForAsset[];

  @Expose()
  @Type(() => DetailAssetAssignmentResponseDto)
  assetAssignments: DetailAssetAssignmentResponseDto[];

  @Expose()
  status?: string;

  @Expose()
  retireDate?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class EmployeeResponseDto extends PickType(DetailEmployeeResponseDto, [
  'name',
  'nik',
  'position',
  'department',
  'workLocation',
] as const) {}
