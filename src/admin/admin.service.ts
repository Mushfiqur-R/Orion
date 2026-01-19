import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { CreateProductDto } from 'src/Dto/Product.dto';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { User, UserDocument } from 'src/schemas/user.schema';


@Injectable()
export class AdminService {
 constructor(
 @InjectModel(User.name) private userModel: Model<UserDocument>,
 @InjectModel(Category.name) private categoryModel:Model<CategoryDocument>,
 @InjectModel(Product.name) private productModel:Model<ProductDocument>) {}
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
    return newProduct.save();
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productModel.find().populate('category').exec();
  }
}
