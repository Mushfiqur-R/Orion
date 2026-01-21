import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({
    example: 'test',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty() 
  name: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'Unique user email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    required: true,
    description: 'User password (required for signup)',
  })
  @IsString()
  @IsNotEmpty() 
  @MinLength(6)
  password: string; 
  

  @ApiProperty({
    example: 'customer',
    description: 'User role (admin/customer)',
    required: false, 
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either admin or customer' })
  role: string; 
}