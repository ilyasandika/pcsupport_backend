import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';
import { WorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';
import { TicketResponseDtoForAsset } from '../../tickets/dto/ticket-response.dto';

export class DetailUserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

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
  tickets: TicketResponseDtoForAsset[];

  @Expose()
  @Type(() => WorkLocationResponseDto)
  workLocation: WorkLocationResponseDto;

  @Expose()
  active: boolean;
}

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  role: Role;
}