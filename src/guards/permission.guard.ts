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
    // ১. রাউটে কোনো পারমিশন চাওয়া হয়েছে কি না দেখি
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // যদি স্পেসিফিক পারমিশন না চায়, তাহলে ছেড়ে দিলাম (RolesGuard তো আছেই)
    }

    const request = context.switchToHttp().getRequest();
    const orgId = request['activeOrgId']; // OrgGuard থেকে আসছে
    const userRole = request['activeRole']; // OrgGuard থেকে আসছে

    if (!orgId || !userRole) {
      throw new ForbiddenException('Critical: OrgID or Role missing from request context');
    }

    // ২. ডাটাবেস চেক: এই অর্গানাইজেশনে এই রোলের কী কী পারমিশন আছে?
    const permissionSettings = await this.rolePermissionModel.findOne({
        orgId: new Types.ObjectId(orgId),
        role: userRole
    });

    if (!permissionSettings || !permissionSettings.permissions) {
        throw new ForbiddenException(`Access Denied: No permissions configured for '${userRole}' in this organization.`);
    }

    // ৩. পারমিশন ম্যাচিং
    const hasPermission = requiredPermissions.every((perm) =>
      permissionSettings.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`You need permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}