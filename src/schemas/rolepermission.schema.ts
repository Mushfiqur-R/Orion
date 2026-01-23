import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RolePermissionDocument = RolePermission & Document;

@Schema()
export class RolePermission {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  orgId: Types.ObjectId;

  @Prop({ required: true })
  role: string; 

  @Prop({ type: [String], default: [] }) 
  permissions: string[];
}
export const RolePermissionSchema = SchemaFactory.createForClass(RolePermission);

