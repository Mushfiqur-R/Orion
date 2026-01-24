import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RolePermission, RolePermissionDocument } from 'src/schemas/rolepermission.schema';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(RolePermission.name) private rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; 
    }

    const request = context.switchToHttp().getRequest();
    const orgId = request['activeOrgId']; 
    const userRole = request['activeRole']; 

    if (!orgId || !userRole) {
      throw new ForbiddenException('Critical: OrgID or Role missing from request context');
    }

   
    const permissionSettings = await this.rolePermissionModel.findOne({
        orgId: new Types.ObjectId(orgId),
        role: userRole
    });

    if (!permissionSettings || !permissionSettings.permissions) {
        throw new ForbiddenException(`Access Denied: No permissions configured for '${userRole}' in this organization.`);
    }
   
    const hasPermission = requiredPermissions.every((perm) =>
      permissionSettings.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`You need permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}