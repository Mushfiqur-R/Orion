import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
