import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserOrgMap, UserOrgMapDocument } from 'src/schemas/UserOrg.schema';


@Injectable()
export class OrgGuard implements CanActivate {
  constructor(@InjectModel(UserOrgMap.name) private UserOrgMapModel:Model<UserOrgMapDocument>){}
 async  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 
    const targetOrgId = request.headers['x-tenant-id']; 

    if (!targetOrgId) {
      throw new BadRequestException('Header "x-tenant-id" is missing');
    }
    const membership= await this.UserOrgMapModel.findOne({
        userId:new Types.ObjectId(user.sub),
        orgId: new Types.ObjectId(targetOrgId)
    })
    if (!membership) {
        throw new ForbiddenException('You are not a member of this Organization');
    }
    
    request['activeOrgId'] = targetOrgId;
    request['activeRole'] = membership.role;
    
    return true;
  }
}