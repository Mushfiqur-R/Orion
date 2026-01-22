import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Document } from "mongoose";
export type UserOrgMapDocument = UserOrgMap & Document;
  export enum OrgRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}
@Schema()
export class UserOrgMap{
    @Prop({type:Types.ObjectId,ref:'User',required:true})
    userId:Types.ObjectId
    @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
    orgId: Types.ObjectId;
    @Prop({ required: true, enum: OrgRole, default: OrgRole.CUSTOMER })
    role: string;
}
export const UserOrgMapSchema = SchemaFactory.createForClass(UserOrgMap);