import { IsNotEmpty, IsNumber, IsString, IsMongoId } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15', description: 'product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: '65a123...', description: 'Category ID' })
  @IsMongoId({ message: 'Category must be a valid MongoDB ObjectId' }) 
  category: string; 
}

export class UpdateProductDto extends PartialType(CreateProductDto){}