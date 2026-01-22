import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { CreateProductDto, UpdateProductDto } from 'src/Dto/Product.dto';
import { CreateUserDto } from 'src/Dto/User.dto';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { User, UserDocument, UserRole } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Organization, OrganizationDocument } from 'src/schemas/organization.schema';
import { CreateOrganizationDto } from 'src/Dto/Organization.dto';

@Injectable()
export class AdminService {
 constructor(
 @InjectModel(User.name) private userModel: Model<UserDocument>,
 @InjectModel(Category.name) private categoryModel:Model<CategoryDocument>,
 @InjectModel(Product.name) private productModel:Model<ProductDocument>,
 @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
 @InjectRedis()private readonly redis:Redis) {}
     getHello(): string {
    return 'Hello Admin!';
  }
  //  async createUser(data: { name: string; email: string; password?: string }): Promise<User> {
  //   const createdUser =  new this.userModel(data);
  //   const saveuser=await createdUser.save();
  //   await this.redis.del("all_users");
  //   return saveuser;
  
  // }
  async createUser(data: CreateUserDto): Promise<User> {
    const { password, orgIds, ...rest } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      ...rest,                 // name, email, role
      password: hashedPassword, 

      orgIds: orgIds || [], 
      
      role: data.role || UserRole.CUSTOMER 
    });
    const saveuser = await createdUser.save();
    await this.redis.del("all_users");
    
    return saveuser;
  }
 
async getUsers(): Promise<User[]> {
    const cachedUsers = await this.redis.get('all_users');
    if (cachedUsers) {
      return JSON.parse(cachedUsers); 
    }
    const users = await this.userModel.find().exec();
    if (users.length > 0) {
      await this.redis.set('all_users', JSON.stringify(users), 'EX', 20);
    }
    return users;
  }
async refreshUserCache() {
    console.log('🔄 Cron Job: Updating User Cache from DB...');
    const users = await this.userModel.find().exec();
    if (users.length > 0) { 
      await this.redis.set('all_users', JSON.stringify(users), 'EX', 20);
    }
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

  async createProduct(data: CreateProductDto,orgId:string): Promise<Product> {
    const newProduct = new this.productModel({...data,orgId:orgId});
    const savedProduct= await newProduct.save();
    await this.redis.del(`products:${orgId}`);
    return savedProduct;

  }

  async findAllProducts(orgId:string): Promise<Product[]> {
    const cashedData= await this.redis.get(`product:${orgId}`);
    if(cashedData){
      return JSON.parse(cashedData);
    }
    const products= await this.productModel.find({orgId:orgId}).populate('category').exec();
    if(products.length>0){
      await this.redis.set(`product:${orgId}`,JSON.stringify(products),'EX',300);
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

    async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    const newOrg = new this.orgModel(data);
    return newOrg.save();
  }
}
