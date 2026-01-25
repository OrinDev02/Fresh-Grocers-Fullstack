import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
