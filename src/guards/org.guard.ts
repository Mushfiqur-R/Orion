import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrgGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 
    const targetOrgId = request.headers['x-tenant-id']; 

    if (!targetOrgId) {
      throw new BadRequestException('Header "x-tenant-id" is missing');
    }
    const hasAccess = user.allowedOrgs && user.allowedOrgs.includes(targetOrgId);
    request['activeOrgId'] = targetOrgId;
    
    return true;
  }
}