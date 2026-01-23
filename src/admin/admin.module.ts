import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema'; // <-- correct relative path
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtAuthGuard } from 'src/guards/jwtGuard';
import { Organization, OrganizationSchema } from 'src/schemas/organization.schema';
import { UserOrgMap, UserOrgMapSchema } from 'src/schemas/UserOrg.schema';
import { RolePermission, RolePermissionSchema } from 'src/schemas/rolepermission.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    {name:Category.name,schema:CategorySchema},
    {name:Product.name,schema:ProductSchema},
    {name:Organization.name,schema:OrganizationSchema},
    {name:UserOrgMap.name,schema:UserOrgMapSchema},
    {name:RolePermission.name,schema:RolePermissionSchema}
    ],),
   
  ],
  controllers: [AdminController],
  providers: [AdminService,JwtAuthGuard],
})
export class AdminModule {}
