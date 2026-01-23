import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrgRole } from 'src/schemas/UserOrg.schema';

export class UpdatePermissionDto {
    @ApiProperty({
    description: 'The role for which you want to update permissions',
    enum: OrgRole, 
    example: OrgRole.ADMIN, 
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(OrgRole)
  role: string; 
  

  @ApiProperty({
    description: 'List of permission strings',
    example: ['create_product', 'view_product', 'delete_user'], // 👈 উদাহরণ
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[]; 
}