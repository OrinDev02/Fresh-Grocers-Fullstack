import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'Fresh Apples', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Fresh red apples', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 29.99, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
