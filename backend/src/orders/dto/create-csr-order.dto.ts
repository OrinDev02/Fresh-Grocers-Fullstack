import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
  IsArray,
  IsPhoneNumber,
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

class OrderItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class CreateCSROrderDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  customerName?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: DeliveryAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @ApiProperty({ example: 50, default: 0, required: false })
  @IsNumber()
  @Min(0)
  deliveryFee?: number;
}
