import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '../../../common/enums/role.enum';
import { WorkLocationResponseDto } from '../../work-locations/dto/work-location-response.dto';
import { TicketResponseDtoForAsset } from '../../tickets/dto/ticket-response.dto';
import { PickType } from '@nestjs/mapped-types';

import {
  TagHistoryItem,
  ReviewHistoryItem,
} from '../interfaces/user-ai-history.interface';

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

  @Expose()
  tags?: string[];

  @Expose()
  tagsUpdatedAt?: Date;

  @Expose()
  review?: string;

  @Expose()
  tagHistory?: TagHistoryItem[];

  @Expose()
  reviewHistory?: ReviewHistoryItem[];

  @Expose()
  isUserHasTicket?: boolean;
}

export class UserResponseDto extends PickType(DetailUserResponseDto, [
  'id',
  'username',
  'fullName',
  'nik',
  'role',
  'signaturePath',
  'tags',
  'tagsUpdatedAt',
  'review',
  'tagHistory',
  'reviewHistory',
] as const) {}
