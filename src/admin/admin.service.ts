import { InjectRedis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model, Types } from 'mongoose';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { CreateProductDto, UpdateProductDto } from 'src/Dto/Product.dto';
import { CreateUserDto } from 'src/Dto/User.dto';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Organization, OrganizationDocument } from 'src/schemas/organization.schema';
import { CreateOrganizationDto } from 'src/Dto/Organization.dto';
import { OrgRole, UserOrgMap, UserOrgMapDocument } from 'src/schemas/UserOrg.schema';
import { RolePermission, RolePermissionDocument } from 'src/schemas/rolepermission.schema';
import { DEFAULT_PERMISSIONS } from 'src/permission';


@Injectable()
export class AdminService {
 constructor(
 @InjectModel(User.name) private userModel: Model<UserDocument>,
 @InjectModel(Category.name) private categoryModel:Model<CategoryDocument>,
 @InjectModel(Product.name) private productModel:Model<ProductDocument>,
 @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
 @InjectModel(UserOrgMap.name) private userOrgMapModel: Model<UserOrgMapDocument>,
 @InjectModel(RolePermission.name) private rolePermissionModel: Model<RolePermissionDocument>,
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
 async createUser(data: CreateUserDto, secureOrgId: string): Promise<any> {
    const { name, email, password, role } = data; 

    let user = await this.userModel.findOne({ email });
    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
        });
    }
    const existingMap = await this.userOrgMapModel.findOne({
        userId: user._id,
        orgId: new Types.ObjectId(secureOrgId)
    });

    if (existingMap) {
        throw new BadRequestException('User is already in this organization');
    }

    await this.userOrgMapModel.create({
        userId: user._id,
        orgId: new Types.ObjectId(secureOrgId), 
        role: role || OrgRole.CUSTOMER 
    });

    await this.redis.del(`users:${secureOrgId}`);
    
    return { message: "User created and linked successfully", userId: user._id };
}

async getUsers(orgId: string): Promise<any[]> {
    const cachedUsers = await this.redis.get(`users:${orgId}`);
    if (cachedUsers) {
      return JSON.parse(cachedUsers); 
    }
    const memberships = await this.userOrgMapModel.find({ orgId:new Types.ObjectId(orgId) })
        .populate('userId', '-password') 
        .exec();
    const users = memberships.map(m => ({
        _id: m.userId['_id'],
        name: m.userId['name'],
        email: m.userId['email'],
        role: m.role 
    }));

    if (users.length > 0) {
      await this.redis.set(`users:${orgId}`, JSON.stringify(users), 'EX', 60);
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
  
  // async deleteUserByEmail(email: string): Promise<any> {
  //   return this.userModel.deleteOne({ email }).exec();
  // }

  async removeUserFromOrg(email: string, orgId: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if(!user) throw new NotFoundException('User not found');
    await this.userOrgMapModel.deleteOne({ userId: user._id, orgId: orgId });
    
    await this.redis.del(`users:${orgId}`);
    return { message: 'User removed from organization' };
  }


  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
  
  async createCategory(data:CreateCategorydto):Promise<Category>{
    const  NewCategory=  new this.categoryModel(data)
    return NewCategory.save();
  }

  async createProduct(data: CreateProductDto,orgId:string): Promise<Product> {
    const newProduct = new this.productModel({...data,
    orgId: new Types.ObjectId(orgId),category:new Types.ObjectId(data.category)})
    const savedProduct= await newProduct.save();
    await this.redis.del(`products:${orgId}`);
    return savedProduct;

  }

 async findAllProducts(orgId: string): Promise<Product[]> {

    const cacheKey = `products:${orgId}`;

    const cachedData = await this.redis.get(cacheKey);
    if(cachedData){
      return JSON.parse(cachedData);
    }
    const products = await this.productModel.find({ 
        orgId: new Types.ObjectId(orgId) 
    })
    .populate('category')
    .populate('orgId', 'name') 
    .exec();

    if(products.length > 0){
      await this.redis.set(cacheKey, JSON.stringify(products), 'EX', 300);
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

  //   async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
  //   const newOrg = new this.orgModel(data);
  //   return newOrg.save();
  // }


  // async createOrganization(data: CreateOrganizationDto, ownerUserId: string): Promise<Organization> {
  //   const newOrg = new this.orgModel(data);
  //   const savedOrg = await newOrg.save();
  //   await this.userOrgMapModel.create({
  //       userId: new Types.ObjectId(ownerUserId),
  //       orgId: savedOrg._id,
  //       role: OrgRole.OWNER
  //   });

  //   return savedOrg;
  // }

    async createOrganization(data: CreateOrganizationDto, ownerUserId: string): Promise<Organization> {
        const newOrg = new this.orgModel(data);
        const savedOrg = await newOrg.save();

        await this.userOrgMapModel.create({
            userId: new Types.ObjectId(ownerUserId),
            orgId: savedOrg._id,
            role: OrgRole.OWNER
        });

        const permissionDocs = Object.keys(DEFAULT_PERMISSIONS).map(role => ({
            orgId: savedOrg._id, 
            role: role,
            permissions: DEFAULT_PERMISSIONS[role]
        }));

       console.log(permissionDocs);
        await this.rolePermissionModel.insertMany(permissionDocs);

        return savedOrg;
    }

    async updateRolePermissions(orgId: string, role: string, newPermissions: string[]) {
  
    if (role === OrgRole.OWNER) {
        throw new BadRequestException('You cannot change OWNER permissions manually for safety.');
    }

    const updatedDoc = await this.rolePermissionModel.findOneAndUpdate(
        { 
            orgId: new Types.ObjectId(orgId),
            role: role 
        },
        { 
            $set: { permissions: newPermissions } 
        },
        { new: true } 
    );
    if (!updatedDoc) {
        throw new NotFoundException(`Role '${role}' not found in this organization.`);
    }

    return updatedDoc;
}

}
