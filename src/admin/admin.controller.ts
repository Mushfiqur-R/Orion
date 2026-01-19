import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService){}

    @Get()
  getAdminHello(): string {
    return this.adminService.getHello();
  }
   @Post('create-user')
  createUser(@Body() data: { name: string; email: string; password?: string }) {
    return this.adminService.createUser(data);
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Delete('delete-user')
  deleteUser(@Query('email') email: string) {
    return this.adminService.deleteUserByEmail(email);
  }

  @Get('user')
  getUser(@Query('email') email: string) {
    return this.adminService.getUserByEmail(email);
  }

}
