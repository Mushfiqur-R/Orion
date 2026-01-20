import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { CreateProductDto, UpdateProductDto } from 'src/Dto/Product.dto';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { User, UserDocument } from 'src/schemas/user.schema';


@Injectable()
export class AdminService {
 constructor(
 @InjectModel(User.name) private userModel: Model<UserDocument>,
 @InjectModel(Category.name) private categoryModel:Model<CategoryDocument>,
 @InjectModel(Product.name) private productModel:Model<ProductDocument>,
 @InjectRedis()private readonly redis:Redis) {}
     getHello(): string {
    return 'Hello Admin!';
  }
   async createUser(data: { name: string; email: string; password?: string }): Promise<User> {
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }

 
  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  
  async deleteUserByEmail(email: string): Promise<any> {
    return this.userModel.deleteOne({ email }).exec();
  }


  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
  
  async createCategory(data:CreateCategorydto):Promise<Category>{
    const  NewCategory=  new this.categoryModel(data)
    return NewCategory.save();
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(data);
    const savedProduct= await newProduct.save();
     await this.redis.del("all_products");
    return savedProduct;
  }

  async findAllProducts(): Promise<Product[]> {
    const cashedData= await this.redis.get('all_products');
    if(cashedData){
      return JSON.parse(cashedData);
    }
    const products= await this.productModel.find().populate('category').exec();
    if(products.length>0){
      await this.redis.set('all_products',JSON.stringify(products),'EX',300);
    }
    return products;
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,data,{ new: true } 
    ).exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    } 
    await this.redis.del("all_products");
    return updatedProduct;
  }
}
