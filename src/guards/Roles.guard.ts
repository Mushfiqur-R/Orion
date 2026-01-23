import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request['activeRole'];
    if (!userRole) {
      throw new ForbiddenException('Access Denied: No active role found for this organization');
    }
    const hasRole = requiredRoles.includes(userRole);
    if (!hasRole) {
       throw new ForbiddenException('Access Denied: You do not have permission');
    }
    return true;
  }
}
