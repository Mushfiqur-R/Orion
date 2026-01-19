import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Category } from "./category.schema";
import { Document } from "mongoose";
import { Types } from "mongoose";

export type ProductDocument = Product & Document

@Schema()
export class Product{

    @Prop({required:true,unique:true})
    name:string;

    @Prop({required:true})
    price:number;

    @Prop({required:true})
    quantity:number;

    @Prop({type:Types.ObjectId,ref:'Category',required:true})
    category:Category;
}
export const ProductSchema= SchemaFactory.createForClass(Product);