import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { OWNERSHIP_KEY, OwnershipOptions } from '../decorators/ownership.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Role } from '../enums/role.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<OwnershipOptions>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    const userField = options.userField || 'sub';
    const allowedRoles = options.bypassRoles || [Role.Admin];
    const paramKey = options.paramKey || 'id';

    // Check if user role is allowed to skip ownership check
    if (allowedRoles.some((role) => user.role === role)) {
      return true;
    }

    const entityId = request.params[paramKey];
    if (!entityId) {
      throw new InternalServerErrorException(
        `URL parameter '${paramKey}' not found for ownership validation`,
      );
    }

    // Resolve service instance dynamically from NestJS container
    const serviceInstance = this.moduleRef.get(options.service, { strict: false });
    if (!serviceInstance || typeof serviceInstance.findOne !== 'function') {
      throw new InternalServerErrorException(
        `Service '${options.service?.name}' not found or missing findOne() method`,
      );
    }

    const entity = await serviceInstance.findOne(entityId);
    if (!entity) {
      throw new NotFoundException(`Resource not found`);
    }

    const currentUserId = user[userField as keyof JwtPayload];
    const resourceOwnerId = entity[options.ownershipField];

    if (
      resourceOwnerId === undefined ||
      resourceOwnerId === null ||
      String(resourceOwnerId) !== String(currentUserId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to modify or access this resource.',
      );
    }

    return true;
  }
}
