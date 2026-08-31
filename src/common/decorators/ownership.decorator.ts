import { SetMetadata, Type } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const OWNERSHIP_KEY = 'ownership_options';

export interface OwnershipOptions {
  /**
   * NestJS Service Class that has a findOne(id) method
   * (e.g., TicketsService, AssetsService, etc.)
   */
  service: Type<any>;

  /**
   * Property/column name on the entity used for ownership comparison
   * (e.g., 'assignedEngineerId', 'createdById', 'userId')
   */
  ownershipField: string;

  /**
   * Property on req.user used as comparison ID (Default: 'sub')
   */
  userField?: string;

  /**
   * List of Roles allowed to skip ownership check (Default: [Role.Admin])
   */
  bypassRoles?: (Role | string)[];

  /**
   * URL parameter name storing the entity ID (Default: 'id')
   */
  paramKey?: string;
}

export const CheckOwnership = (options: OwnershipOptions) =>
  SetMetadata(OWNERSHIP_KEY, options);
