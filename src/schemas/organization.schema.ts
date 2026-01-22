import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export  type OrganizationDocument= Organization & Document

@Schema()
export class Organization {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string; 

  @Prop()
  address: string;
}
export const OrganizationSchema=SchemaFactory.createForClass(Organization);