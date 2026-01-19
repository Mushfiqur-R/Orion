import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'test',
    description: 'User full name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'test@example.com',
    description: 'Unique user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password',
    required: false,
    description: 'User password (optional)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
