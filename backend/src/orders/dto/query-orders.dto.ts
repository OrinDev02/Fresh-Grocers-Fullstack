import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOrdersDto {
  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'DELIVERED', 'CANCELLED'],
    required: false,
  })
  @IsEnum(['PENDING', 'ASSIGNED', 'ACCEPTED', 'DELIVERED', 'CANCELLED'])
  @IsOptional()
  status?: string;

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
