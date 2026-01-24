import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/Dto/User.dto';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { Category } from 'src/schemas/category.schema';
import { CreateProductDto, UpdateProductDto } from 'src/Dto/Product.dto';
import { Product } from 'src/schemas/product.schema';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Cron } from '@nestjs/schedule';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/guards/jwtGuard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/guards/roles.decorator';
import { CreateOrganizationDto } from 'src/Dto/Organization.dto';
import { OrgGuard } from 'src/guards/org.guard';
import { OrgRole } from 'src/schemas/UserOrg.schema';
import { RequirePermissions } from 'src/guards/permission.decorator';
import { PermissionsGuard } from 'src/guards/permission.guard';
import { UpdatePermissionDto } from 'src/Dto/updatepermission.dto';

@ApiBearerAuth()
@ApiTags('Admin')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Organization ID (e.g. 65a...)',
  required: true,
})
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService){}

    @Get()
    @ApiOperation({ summary: 'Test admin API' })
    getAdminHello(): string {
    return this.adminService.getHello();
    }
   
    @Throttle({default:{ttl:60000,limit:2}})
    @Post('create-user')
    @UseGuards(JwtAuthGuard,OrgGuard, RolesGuard) 
    @Roles(OrgRole.OWNER,OrgRole.ADMIN)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    createUser(@Body() data: CreateUserDto, @Req() req) {
    const orgId = req['activeOrgId']; 
    return this.adminService.createUser(data, orgId);
}
    
    @Throttle({default:{ttl:60000,limit:3}})
    @Get('users')
    @UseGuards(JwtAuthGuard,OrgGuard,RolesGuard)
    @Roles(OrgRole.ADMIN,OrgRole.OWNER)
    @ApiOperation({ summary: 'Get all users' })
    getUsers(@Req()req) {
    const orgId = req['activeOrgId'];
    return this.adminService.getUsers(orgId);
    }

    @SkipThrottle()
    // @Cron('*/10 * * * * *') 
    async handleUserUpdate() {
    await this.adminService.refreshUserCache();
    }

    @Delete('delete-user')
    @UseGuards(JwtAuthGuard, OrgGuard, RolesGuard)
    @Roles(OrgRole.ADMIN, OrgRole.OWNER)
    @ApiOperation({ summary: 'Remove user from organization' })
    deleteUser(@Query('email') email: string, @Req() req) {
       const orgId = req['activeOrgId'];
       return this.adminService.removeUserFromOrg(email, orgId);
    }

    @SkipThrottle()
    @Get('user')
    @ApiOperation({ summary: 'Get single user by email' })
    @ApiQuery({ name: 'email', example: 'test@example.com' })
    getUser(@Query('email') email: string) {
    return this.adminService.getUserByEmail(email);
  }

  @Throttle({default:{ttl:60000,limit:1}})
  @Post("createcatagory")
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(OrgRole.ADMIN)
   @ApiOperation({ summary: 'create catagory' })
  async createCatagory(@Body() data:CreateCategorydto):Promise<Category>{
    return this.adminService.createCategory(data);
  }
  
@Throttle({default:{ttl:60000,limit:3}})
    @Post('createproduct')
    @UseGuards(JwtAuthGuard, OrgGuard, RolesGuard,PermissionsGuard)
    @Roles(OrgRole.ADMIN, OrgRole.OWNER)
    @RequirePermissions('create_product')
    @ApiOperation({ summary: 'create product' })
    
    async create(@Body() data: CreateProductDto , @Req() req): Promise<Product> {
    const orgId = req['activeOrgId'];
    return this.adminService.createProduct(data, orgId);
    }
  
@SkipThrottle()
    @Get('getallproducts')
    @UseGuards(JwtAuthGuard, OrgGuard, RolesGuard,PermissionsGuard)
    @RequirePermissions('view_product')
    @ApiOperation({summary:'get all products from single or multiple orgs'})
    async getAll(@Req() req): Promise<Product[]> { 
    const orgId = req['activeOrgId']; 
    return this.adminService.findAllProducts(orgId);
    }
   
  @Throttle({default:{ttl:60000,limit:1}})
  @Patch('updateproduct/:id')
   @UseGuards(JwtAuthGuard,RolesGuard)
   @Roles(OrgRole.ADMIN)
  @ApiOperation({summary:'update product info'})
  async updateProduct(@Param('id') id: string,@Body() data: UpdateProductDto){
    return this.adminService.updateProduct(id, data);
  }
   
 
   @Post('create-org')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create new Organization' })
    createOrg(@Body() data: CreateOrganizationDto, @Req() req) {
    const userId = req.user.sub; 
    return this.adminService.createOrganization(data, userId);
    }

    @Post('update-permissions')
    @UseGuards(JwtAuthGuard, OrgGuard, RolesGuard)
    @Roles(OrgRole.OWNER)
    @ApiOperation({ summary: 'Update permissions for a specific role in Org' })
    async updatePermissions(@Body() dto: UpdatePermissionDto, @Req() req) {
    const orgId = req['activeOrgId'];
    
    return this.adminService.updateRolePermissions(
        orgId, 
        dto.role, 
        dto.permissions
    );
}
}
