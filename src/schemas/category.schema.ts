import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
export type CategoryDocument = Category & Document

@Schema()
export class Category{

    @Prop({required:true,unique:true})
    name:string;

    @Prop()
    description:string;

    @Prop({types:Types.ObjectId,ref:'Organization',required:true})
    orgIds:Types.ObjectId[]
}
export const CategorySchema=SchemaFactory.createForClass(Category);
