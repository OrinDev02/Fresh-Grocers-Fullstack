import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Fresh Apples' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Fresh red apples', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 100, default: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}
