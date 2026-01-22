import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}
@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string; 
  @Prop({ default: UserRole.CUSTOMER, enum: UserRole }) 
  role: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Organization' }] })
  orgIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
