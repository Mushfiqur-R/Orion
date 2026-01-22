import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
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


  @ApiProperty({
    type: [String],
    example: ['65a1b2c3d4e5f67890123456'], 
    description: 'List of Organization IDs this user belongs to',
    required: false
  })
  @IsOptional() 
  @IsArray()
  @IsMongoId({ each: true, message: 'Each orgId must be a valid MongoDB ObjectId' })
  orgIds?: string[];
}