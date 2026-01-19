import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/Dto/User.dto';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { Category } from 'src/schemas/category.schema';
import { CreateProductDto } from 'src/Dto/Product.dto';
import { Product } from 'src/schemas/product.schema';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService){}

    @Get()
    @ApiOperation({ summary: 'Test admin API' })
    getAdminHello(): string {
    return this.adminService.getHello();
    }

    @Post('create-user')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    createUser(@Body() data:CreateUserDto) {
    return this.adminService.createUser(data);
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    getUsers() {
    return this.adminService.getUsers();
    }

    @Delete('delete-user')
    @ApiOperation({ summary: 'Delete user by email' })
    @ApiQuery({ name: 'email', example: 'test@example.com' })
    deleteUser(@Query('email') email: string) {
    return this.adminService.deleteUserByEmail(email);
   }

    @Get('user')
    @ApiOperation({ summary: 'Get single user by email' })
    @ApiQuery({ name: 'email', example: 'test@example.com' })
    getUser(@Query('email') email: string) {
    return this.adminService.getUserByEmail(email);
  }

  @Post("createcatagory")
  async createCatagory(@Body() data:CreateCategorydto):Promise<Category>{
    return this.adminService.createCategory(data);
  }
  
  @Post('createproduct')
  async create(@Body() data: CreateProductDto): Promise<Product> {
    return this.adminService.createProduct(data);
  }

  @Get('getallproducts')
  async getAll(): Promise<Product[]> {
    return this.adminService.findAllProducts();
  }
  


}
