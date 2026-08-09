import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';
import { WorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';
import { TicketResponseDtoForAsset } from '../../tickets/dto/ticket-response.dto';
import { PickType } from '@nestjs/mapped-types';

export class DetailUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  nik?: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  role: Role;

  @Expose()
  @Type(() => TicketResponseDtoForAsset)
  tickets?: TicketResponseDtoForAsset[];

  @Expose()
  @Type(() => TicketResponseDtoForAsset)
  createdTicket?: TicketResponseDtoForAsset[];

  @Expose()
  @Type(() => WorkLocationResponseDto)
  workLocation: WorkLocationResponseDto;

  @Expose()
  signaturePath?: string;

  @Expose()
  active: boolean;
}

export class UserResponseDto extends PickType(DetailUserResponseDto, [
  'id',
  'username',
  'fullName',
  'role',
] as const) {}
