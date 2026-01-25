import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class NearbyDeliveryDto {
  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: -74.006 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: 5, default: 5, required: false })
  @IsNumber()
  @Min(1)
  radius?: number;
}
