import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategorydto{
    
  @ApiProperty({ example: 'Electronics', description: 'provide categoryname' }) // Swagger এ দেখাবে
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @ApiProperty({ example: 'All electronic items', description: 'give description' })
  @IsString()
  @IsOptional() 
  description?: string;
}