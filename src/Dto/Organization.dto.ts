import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Org A', description: 'Organization Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'org-a-bd', description: 'Unique Slug (URL friendly)' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Dhaka', required: false })
  @IsString()
  address?: string;
}