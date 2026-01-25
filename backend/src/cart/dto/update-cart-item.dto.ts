import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsNotEmpty } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
