import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class DeliveryAddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Manhattan' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: -74.006, required: false })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: DeliveryAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({ example: 0, default: 0, required: false })
  @IsNumber()
  @Min(0)
  deliveryFee?: number;
}
