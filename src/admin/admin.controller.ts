import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/Dto/User.dto';
import { CreateCategorydto } from 'src/Dto/Category.dto';
import { Category } from 'src/schemas/category.schema';
import { CreateProductDto, UpdateProductDto } from 'src/Dto/Product.dto';
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
   @ApiOperation({ summary: 'create catagory' })
  async createCatagory(@Body() data:CreateCategorydto):Promise<Category>{
    return this.adminService.createCategory(data);
  }
  
  @Post('createproduct')
  @ApiOperation({ summary: 'create product' })
  async create(@Body() data: CreateProductDto): Promise<Product> {
    return this.adminService.createProduct(data);
  }

  @Get('getallproducts')
  @ApiOperation({summary:'get all products'})
  async getAll(): Promise<Product[]> {
    return this.adminService.findAllProducts();
  }

  @Patch('updateproduct/:id')
  @ApiOperation({summary:'update product info'})
  async updateProduct(@Param('id') id: string,@Body() data: UpdateProductDto){
    return this.adminService.updateProduct(id, data);
  }


}
