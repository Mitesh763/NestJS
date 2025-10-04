import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateOrderDto {
  @Type(() => Number)
  @IsNumber()
  shippingAddressId: number;

  @Type(() => Number)
  @IsNumber()
  total_price: number;
}
