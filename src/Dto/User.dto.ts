import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { OrgRole } from 'src/schemas/UserOrg.schema';


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
    example: 'password',
    required: true,
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty() 
  @MinLength(6)
  password: string; 
  
  @ApiProperty({
    example: OrgRole.CUSTOMER, 
    description: 'Role inside the organization (admin/manager/customer)',
    required: false, 
    enum: OrgRole,
    enumName: 'OrgRole',      // 👈 ২. এই লাইনটি খুব গুরুত্বপূর্ণ (Dropdown দেখানোর জন্য)
  })
  @IsOptional()
  @IsEnum(OrgRole, { message: 'Invalid role for organization' })
  role: string; 



  @ApiProperty({
    type: String,
    example: '65a1b2c3d4e5f67890123456', 
    description: 'Organization ID to add this user to',
    required: true
  })
  @IsOptional()
  @IsMongoId({ message: 'orgId must be a valid MongoDB ObjectId' })
  orgId?: string;
}