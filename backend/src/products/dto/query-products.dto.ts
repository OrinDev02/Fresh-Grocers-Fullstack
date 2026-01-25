import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductsDto {
  @ApiProperty({ example: 'apple', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 1, default: 1, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 20, default: 20, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}
