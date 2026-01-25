import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateDeliveryProfileDto {
  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Manhattan', required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -74.006, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: 'Motorcycle', required: false })
  @IsString()
  @IsOptional()
  vehicleType?: string;
}
